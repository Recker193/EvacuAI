import 'dotenv/config'

import { createServer, type IncomingMessage, type ServerResponse } from 'node:http'
import { readFile, readdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { floorPlanSchema } from '../src/lib/schemas'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const projectRoot = path.resolve(__dirname, '..')

const GUIDE_PATH = path.join(
  projectRoot,
  'ai',
  'floor-plan-guide.md',
)

const EXAMPLES_DIR = path.join(
  projectRoot,
  'ai',
  'examples',
)

const PORT = 3001
const NVIDIA_ENDPOINT =
  'https://integrate.api.nvidia.com/v1/chat/completions'

const MODEL = 'google/gemma-4-31b-it'

interface AnalyzeRequest {
  image: string
  mediaType: string
}

function sendJson(
  res: ServerResponse,
  statusCode: number,
  data: unknown,
) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  })

  res.end(JSON.stringify(data))
}

async function readRequestBody(
  req: IncomingMessage,
): Promise<string> {
  const chunks: Buffer[] = []
  let totalBytes = 0

  for await (const chunk of req) {
    const buffer = Buffer.isBuffer(chunk)
      ? chunk
      : Buffer.from(chunk)

    totalBytes += buffer.length

    if (totalBytes > 15 * 1024 * 1024) {
      throw new Error(
        'Request is too large. Maximum size is 15 MB.',
      )
    }

    chunks.push(buffer)
  }

  return Buffer.concat(chunks).toString('utf8')
}

function cleanModelJson(text: string): string {
  let cleaned = text.trim()

  // Remove markdown code fences if the model adds them.
  cleaned = cleaned
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim()

  // Remove accidental explanation before/after the JSON.
  const firstBrace = cleaned.indexOf('{')
  const lastBrace = cleaned.lastIndexOf('}')

  if (
    firstBrace !== -1 &&
    lastBrace !== -1 &&
    lastBrace > firstBrace
  ) {
    cleaned = cleaned.slice(
      firstBrace,
      lastBrace + 1,
    )
  }

  return cleaned
}

function isSupportedImage(
  mediaType: string,
): boolean {
  return (
    mediaType === 'image/png' ||
    mediaType === 'image/jpeg'
  )
}

function toDataUrl(
  data: Buffer,
  mediaType: string,
): string {
  return `data:${mediaType};base64,${data.toString('base64')}`
}

async function loadReferenceImages() {
  let files: string[]

  try {
    files = await readdir(EXAMPLES_DIR)
  } catch {
    return []
  }

  const supportedFiles = files.filter((file) => {
    const extension = path
      .extname(file)
      .toLowerCase()

    return (
      extension === '.png' ||
      extension === '.jpg' ||
      extension === '.jpeg'
    )
  })

  // Keep the prompt reasonable during development.
  const imageFiles = supportedFiles.slice(0, 3)

  const results: {
    image: Buffer
    mediaType: string
    filename: string
  }[] = []

  for (const filename of imageFiles) {
    const extension = path
      .extname(filename)
      .toLowerCase()

    const mediaType =
      extension === '.png'
        ? 'image/png'
        : 'image/jpeg'

    const image = await readFile(
      path.join(EXAMPLES_DIR, filename),
    )

    results.push({
      image,
      mediaType,
      filename,
    })
  }

  return results
}

async function analyzeFloorPlan(
  input: AnalyzeRequest,
) {
  if (!process.env.NVIDIA_API_KEY) {
    throw new Error(
      'NVIDIA_API_KEY is missing from .env',
    )
  }

  if (!input.image) {
    throw new Error(
      'No floor-plan image was provided.',
    )
  }

  if (!isSupportedImage(input.mediaType)) {
    throw new Error(
      'Unsupported image format. Use PNG or JPEG.',
    )
  }

  const guide = await readFile(
    GUIDE_PATH,
    'utf8',
  )

  const referenceImages =
    await loadReferenceImages()

  const content: Array<
    | {
        type: 'image_url'
        image_url: {
          url: string
        }
      }
    | {
        type: 'text'
        text: string
      }
  > = []

  /*
   * NVIDIA recommends placing image content
   * before the text prompt for multimodal tasks.
   */

  for (const reference of referenceImages) {
    content.push({
      type: 'image_url',
      image_url: {
        url: toDataUrl(
          reference.image,
          reference.mediaType,
        ),
      },
    })
  }

  // The actual uploaded floor plan.
  content.push({
    type: 'image_url',
    image_url: {
      url: toDataUrl(
        Buffer.from(input.image, 'base64'),
        input.mediaType,
      ),
    },
  })

  content.push({
    type: 'text',
    text: `
You are the floor-plan analysis engine for EvacuAI.

The earlier images are REFERENCE EXAMPLES.
The LAST image is the ACTUAL FLOOR PLAN.

Use the reference images only to understand
the expected interpretation.

Your job is to convert the actual floor plan
into structured JSON that a computer program
can use.

IMPORTANT RULES:

1. Do not invent rooms that are not visible.
2. Do not invent exits that are not visible.
3. Do not confuse furniture with walls.
4. Follow the floor-plan guide carefully.
5. Coordinates must be normalized to a 1000 x 1000 canvas.
6. Every polygon point must have x and y from 0 to 1000.
7. Every ID must be unique.
8. Connections must reference existing IDs.
9. Return ONLY valid JSON.
10. Do not use markdown.
11. Do not explain your answer.
12. When uncertain, prefer the visible structure rather
    than inventing information.

Required JSON structure:

{
  "width": 1000,
  "height": 1000,
  "rooms": [
    {
      "id": "room-1",
      "name": "Classroom 1",
      "kind": "room",
      "polygon": [
        { "x": 100, "y": 100 },
        { "x": 300, "y": 100 },
        { "x": 300, "y": 250 },
        { "x": 100, "y": 250 }
      ],
      "connections": ["corridor-1"]
    }
  ],
  "exits": [
    {
      "id": "exit-1",
      "name": "Exit A",
      "position": {
        "x": 950,
        "y": 500
      }
    }
  ],
  "doors": [
    {
      "id": "door-1",
      "position": {
        "x": 300,
        "y": 175
      },
      "connects": [
        "room-1",
        "corridor-1"
      ]
    }
  ]
}

FLOOR-PLAN INTERPRETATION GUIDE:

--- GUIDE START ---

${guide}

--- GUIDE END ---
    `.trim(),
  })

  const response = await fetch(
    NVIDIA_ENDPOINT,
    {
      method: 'POST',

      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.NVIDIA_API_KEY}`,
      },

      body: JSON.stringify({
        model: MODEL,

        messages: [
          {
            role: 'user',
            content,
          },
        ],

        temperature: 0.1,
        max_tokens: 8000,
      }),
    },
  )

  const responseText =
    await response.text()

  if (!response.ok) {
    throw new Error(
      `NVIDIA API error (${response.status}): ${responseText}`,
    )
  }

  let apiData: {
    choices?: Array<{
      message?: {
        content?: string
      }
    }>
  }

  try {
    apiData = JSON.parse(
      responseText,
    )
  } catch {
    throw new Error(
      `NVIDIA returned invalid JSON:\n${responseText}`,
    )
  }

  const modelText =
    apiData.choices?.[0]?.message?.content

  if (
    typeof modelText !== 'string' ||
    modelText.trim().length === 0
  ) {
    throw new Error(
      `NVIDIA returned no model output:\n${responseText}`,
    )
  }

  const cleanedJson =
    cleanModelJson(modelText)

  let parsed: unknown

  try {
    parsed = JSON.parse(
      cleanedJson,
    )
  } catch {
    throw new Error(
      `The model did not return valid floor-plan JSON.\n\nModel output:\n${modelText}`,
    )
  }

  const validation =
    floorPlanSchema.safeParse(parsed)

  if (!validation.success) {
    throw new Error(
      `AI output failed validation:\n${JSON.stringify(
        validation.error.issues,
        null,
        2,
      )}`,
    )
  }

  return validation.data
}

const server = createServer(
  async (req, res) => {
    try {
      if (
        req.method === 'POST' &&
        req.url === '/api/analyze-floorplan'
      ) {
        const body =
          await readRequestBody(req)

        let input: AnalyzeRequest

        try {
          input = JSON.parse(body)
        } catch {
          sendJson(res, 400, {
            success: false,
            error: 'Invalid request JSON.',
          })

          return
        }

        const result =
          await analyzeFloorPlan(input)

        sendJson(res, 200, {
          success: true,
          floorPlan: result,
        })

        return
      }

      sendJson(res, 404, {
        success: false,
        error: 'Not found.',
      })
    } catch (error) {
      console.error(error)

      sendJson(res, 500, {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Unknown server error.',
      })
    }
  },
)

server.listen(PORT, () => {
  console.log(
    `EvacuAI AI server running on http://localhost:${PORT}`,
  )
})