<script setup lang="ts">
import { ref } from 'vue'

const selectedFile = ref<File | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)
const result = ref<unknown | null>(null)

function selectFile(event: Event) {
  const input =
    event.target as HTMLInputElement

  const file = input.files?.[0]

  if (!file) {
    return
  }

  selectedFile.value = file
  error.value = null
  result.value = null
}

function fileToDataUrl(
  file: File,
): Promise<string> {
  return new Promise(
    (resolve, reject) => {
      const reader =
        new FileReader()

      reader.onload = () => {
        if (
          typeof reader.result !==
          'string'
        ) {
          reject(
            new Error(
              'Could not read the image.',
            ),
          )

          return
        }

        resolve(reader.result)
      }

      reader.onerror = () => {
        reject(
          new Error(
            'Could not read the image.',
          ),
        )
      }

      reader.readAsDataURL(file)
    },
  )
}

/*
 * Convert WebP or other browser-supported
 * image formats to PNG.
 */
function convertToPng(
  file: File,
): Promise<Blob> {
  return new Promise(
    (resolve, reject) => {
      const image =
        new Image()

      const objectUrl =
        URL.createObjectURL(file)

      image.onload = () => {
        const canvas =
          document.createElement(
            'canvas',
          )

        canvas.width =
          image.naturalWidth

        canvas.height =
          image.naturalHeight

        const context =
          canvas.getContext('2d')

        if (!context) {
          URL.revokeObjectURL(
            objectUrl,
          )

          reject(
            new Error(
              'Could not create image canvas.',
            ),
          )

          return
        }

        context.drawImage(
          image,
          0,
          0,
        )

        canvas.toBlob(
          (blob) => {
            URL.revokeObjectURL(
              objectUrl,
            )

            if (!blob) {
              reject(
                new Error(
                  'Could not convert image to PNG.',
                ),
              )

              return
            }

            resolve(blob)
          },
          'image/png',
        )
      }

      image.onerror = () => {
        URL.revokeObjectURL(
          objectUrl,
        )

        reject(
          new Error(
            'Could not load image.',
          ),
        )
      }

      image.src = objectUrl
    },
  )
}

async function prepareImage(
  file: File,
): Promise<{
  base64: string
  mediaType: string
}> {
  let finalFile = file

  /*
   * NVIDIA request will receive PNG/JPEG.
   * WebP is converted locally in the browser.
   */
  if (file.type === 'image/webp') {
    const pngBlob =
      await convertToPng(file)

    finalFile = new File(
      [pngBlob],
      `${file.name.replace(
        /\.webp$/i,
        '',
      )}.png`,
      {
        type: 'image/png',
      },
    )
  }

  if (
    finalFile.type !== 'image/png' &&
    finalFile.type !== 'image/jpeg'
  ) {
    throw new Error(
      'Please select a PNG, JPEG, or WebP image.',
    )
  }

  const dataUrl =
    await fileToDataUrl(finalFile)

  const commaIndex =
    dataUrl.indexOf(',')

  if (commaIndex === -1) {
    throw new Error(
      'Invalid image data.',
    )
  }

  return {
    base64: dataUrl.slice(
      commaIndex + 1,
    ),

    mediaType:
      finalFile.type,
  }
}

async function analyze() {
  if (!selectedFile.value) {
    return
  }

  loading.value = true
  error.value = null
  result.value = null

  try {
    const image =
      await prepareImage(
        selectedFile.value,
      )

    const response =
      await fetch(
        '/api/analyze-floorplan',
        {
          method: 'POST',

          headers: {
            'Content-Type':
              'application/json',
          },

          body: JSON.stringify({
            image: image.base64,
            mediaType:
              image.mediaType,
          }),
        },
      )

    const data =
      await response.json()

    if (
      !response.ok ||
      !data.success
    ) {
      throw new Error(
        data.error ||
          'Floor-plan analysis failed.',
      )
    }

    result.value =
      data.floorPlan
  } catch (err) {
    error.value =
      err instanceof Error
        ? err.message
        : 'Unknown error.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <section
    class="rounded-xl border border-slate-700 bg-slate-900 p-6"
  >
    <div class="mb-5">
      <p
        class="text-sm font-medium uppercase tracking-widest text-red-400"
      >
        AI Floor-Plan Analysis
      </p>

      <h2 class="mt-1 text-xl font-bold">
        Upload a floor plan
      </h2>

      <p
        class="mt-2 text-sm text-slate-400"
      >
        EvacuAI will analyze the image using
        your floor-plan guide and reference images.
      </p>
    </div>

    <div class="space-y-4">
      <input
        type="file"
        accept="image/png,image/jpeg,image/webp"
        class="block w-full rounded-lg border border-slate-700 bg-slate-950 p-3 text-sm text-slate-300 file:mr-4 file:rounded-md file:border-0 file:bg-slate-700 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-slate-600"
        @change="selectFile"
      />

      <p
        v-if="selectedFile"
        class="text-sm text-slate-400"
      >
        Selected:
        <span class="font-medium text-white">
          {{ selectedFile.name }}
        </span>
      </p>

      <button
        class="rounded-lg bg-red-600 px-5 py-2.5 font-medium text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
        :disabled="
          !selectedFile || loading
        "
        @click="analyze"
      >
        {{
          loading
            ? 'Analyzing floor plan...'
            : 'Analyze floor plan'
        }}
      </button>

      <div
        v-if="loading"
        class="rounded-lg border border-slate-700 bg-slate-950 p-4 text-sm text-slate-400"
      >
        Sending the floor plan to the vision model...
      </div>

      <div
        v-if="error"
        class="rounded-lg border border-red-800 bg-red-950 p-4 text-sm text-red-300"
      >
        <p class="font-semibold">
          Analysis failed
        </p>

        <pre
          class="mt-2 whitespace-pre-wrap"
        >{{ error }}</pre>
      </div>

      <div
        v-if="result"
        class="rounded-lg border border-slate-700 bg-slate-950 p-4"
      >
        <p
          class="mb-3 font-semibold text-green-400"
        >
          ✓ Floor plan successfully analyzed
        </p>

        <pre
          class="max-h-[500px] overflow-auto text-xs leading-relaxed text-slate-300"
        >{{ JSON.stringify(result, null, 2) }}</pre>
      </div>
    </div>
  </section>
</template>