# Floor Plan Reading Guide for AI Agents

## Overview
This guide enables an AI agent to analyze and reproduce floor plans by understanding standard architectural symbols, room identification, door types, and spatial relationships.

---

## Part 1: Room Identification & Labeling

### Standard Room Legend - Residential

Floor plans use numbered labels to identify rooms. The base residential legend includes:

1. **FOYER** - Entry hallway/vestibule
2. **LIVING / DINING** - Combined living and dining area
3. **LIBRARY** - Study or library room
4. **BREAKFAST** - Breakfast nook or breakfast room
5. **KITCHEN** - Cooking and food preparation area
6. **MUDROOM** - Utility entry area for outdoor gear
7. **GARAGE** - Vehicle storage and parking
8. **MASTER BEDROOM** - Primary bedroom
9. **MASTER BATH** - Bathroom attached to master bedroom
10. **BEDROOM** - Secondary/additional bedrooms
11. **LAUNDRY** - Laundry room or utility closet
12. **DECK** - Outdoor elevated platform

### Extended Room Types - Educational Facilities

13. **CLASSROOM** - Teaching space with student desks/seats
14. **LECTURE HALL** - Large tiered seating for presentations
15. **LABORATORY** - Lab space with specialized equipment (chemistry, biology, physics, etc.)
16. **COMPUTER LAB** - Lab with workstations and networked computers
17. **LIBRARY / MEDIA CENTER** - Book storage and study resource area
18. **CAFETERIA** - Large food service and dining area
19. **GYMNASIUM** - Athletic training and sport facility
20. **AUDITORIUM** - Large assembly or performance space
21. **ADMINISTRATIVE OFFICE** - Management and office space
22. **STAFF ROOM** - Faculty/staff break and planning area
23. **STUDENT LOUNGE** - Informal student gathering area
24. **COUNSELING OFFICE** - Student counseling and advisory space
25. **NURSE'S OFFICE** - Medical clinic space
26. **STORAGE / SUPPLY** - Equipment and supply storage
27. **MECHANICAL ROOM** - HVAC and utilities
28. **RESTROOM** - Bathroom facilities

### Extended Room Types - Commercial/Specialized Facilities

29. **OFFICE** - Standard office/workspace
30. **CONFERENCE ROOM** - Meeting space
31. **BREAK ROOM** - Employee kitchen/lounge
32. **RECEPTION** - Lobby or greeting area
33. **WAREHOUSE** - Large storage area
34. **PRODUCTION FLOOR** - Manufacturing or assembly space
35. **RETAIL SPACE** - Merchandise display area
36. **STOCKROOM** - Inventory storage
37. **LOADING DOCK** - Receiving/shipping area
38. **EQUIPMENT ROOM** - Specialized machinery space
39. **TESTING FACILITY** - Quality assurance testing area
40. **TRAINING ROOM** - Employee training and development

### Extended Room Types - Medical/Healthcare

41. **EXAMINATION ROOM** - Patient examination space
42. **OPERATING ROOM** - Surgical suite
43. **WAITING ROOM** - Patient waiting area
44. **PHARMACY** - Medication dispensary
45. **RADIOLOGY** - Imaging department
46. **LABORATORY (Medical)** - Clinical testing lab
47. **RECOVERY ROOM** - Post-operative recovery space
48. **ISOLATION ROOM** - Quarantine/isolation patient space

### Extended Room Types - Hospitality

49. **HOTEL ROOM** - Guest bedroom
50. **SUITE** - Multi-room guest accommodation
51. **RESTAURANT** - Dining service area
52. **BAR / LOUNGE** - Beverage service area
53. **KITCHEN (Commercial)** - Commercial food preparation
54. **BANQUET HALL** - Large event space
55. **BALLROOM** - Dance and event space

### Extended Room Types - Fitness/Recreation

56. **WEIGHT ROOM** - Weightlifting area
57. **CARDIO ROOM** - Cardiovascular equipment area
58. **YOGA STUDIO** - Yoga and stretching studio
59. **SWIMMING POOL** - Aquatic facility
60. **LOCKER ROOM** - Changing and storage facility
61. **SAUNA** - Sauna facility
62. **STEAM ROOM** - Steam therapy room

### Dynamic Room Type Variables

**Important: The above numbers 1-62 are standard reference types. However, floor plans can use CUSTOM ROOM TYPES defined by the application user.**

#### How Dynamic Room Variables Work

When analyzing a floor plan, the application may define custom room type mappings. These appear as:

```
ROOM_LEGEND = {
  "1": "CLASSROOM",
  "2": "LABORATORY",
  "3": "ADMINISTRATIVE_OFFICE",
  "4": "STORAGE",
  "5": "HALLWAY",
  "CUSTOM_TYPE_A": "SPECIALIZED_RESEARCH_SPACE",
  "CUSTOM_TYPE_B": "3D_PRINTING_LAB"
}
```

Or as a labeled legend on the floor plan itself:
```
1. CLASSROOM
2. SCIENCE LAB
3. MAKER SPACE
4. MEDITATION ROOM
5. STAFF KITCHEN
```

#### AI Agent Instruction for Dynamic Rooms

1. **Check for Custom Legend First** - Before using standard room types, look for a legend or mapping provided in the floor plan metadata or in a `ROOM_LEGEND` variable
2. **Use Provided Mappings** - Any room label/number found in the custom mapping takes precedence over standard definitions
3. **Apply Labels Consistently** - Once a room number is mapped to a specific type, apply that same type to all instances of that room number in the plan
4. **Identify Unlabeled Custom Rooms** - If a room number/label appears on the plan but is not in the provided legend, request clarification or flag it as unknown
5. **Handle Text Labels Directly** - If rooms are labeled with text names (not just numbers), treat those text names as the authoritative room type
6. **Preserve Custom Naming** - When reproducing plans with custom room types, maintain the exact naming provided by the user

#### Example: Dynamic Room Legend in Use

**Given Input:**
```
Floor Plan with numbered rooms
Custom Legend from App User:
  1 = "Recording Studio"
  2 = "Control Room"
  3 = "Vocal Booth"
  4 = "Equipment Storage"
```

**AI Agent Processing:**
- Identifies room labeled "1" → Applies "Recording Studio" (NOT "FOYER")
- Identifies room labeled "2" → Applies "Control Room" (NOT "LIVING/DINING")
- Identifies room labeled "3" → Applies "Vocal Booth" (NOT "LIBRARY")
- Identifies room labeled "4" → Applies "Equipment Storage" (NOT "BREAKFAST")
- When reproducing: Uses exact custom names provided in legend

### Identifying Rooms in Plans
- Each room is clearly labeled with a number or text name inside its boundaries
- Room dimensions are provided (e.g., "61.63 m²", "108.78 m²")
- Thick black lines indicate walls that fully enclose the room
- Thin lines or dashed lines may indicate open conceptual spaces or partial divisions
- **For custom/dynamic rooms:** Always check for a `ROOM_LEGEND` variable or on-plan legend first before defaulting to standard room types

---

## Part 2: Door Types & Symbols

### Single Swing Door
**Symbol:** Arc drawn from hinge point to show swing direction, with one continuous arc
- **Visual:** One quarter-circle arc from the door pivot point
- **Meaning:** Door swings in one direction only (typically 90 degrees)
- **Use:** Bathrooms, bedrooms, closets, most interior rooms
- **Characteristic:** The arc shows which way the door opens and the clearance space needed

### Double Swing Door
**Symbol:** Two arcs meeting in the middle, creating a wave-like pattern
- **Visual:** Two arcs that mirror each other, touching at center
- **Meaning:** Door can swing in both directions
- **Use:** Kitchen entries, commercial entries, utility areas
- **Characteristic:** Allows passage from either side without stopping the door

### Pocket Door
**Symbol:** Dashed lines showing the door panel in its closed position, with the recess indicated
- **Visual:** Thick dashed line in doorway, indicating door slides into wall cavity
- **Meaning:** Door slides horizontally into the wall when opened
- **Use:** Space-saving applications, tight hallways, closets
- **Characteristic:** Requires recessed pocket in wall structure; door disappears when fully open

### Bifold Door
**Symbol:** Multiple connected segments meeting at center point with accordion-like fold lines
- **Visual:** Two or more panels shown with fold lines and a center pivot
- **Meaning:** Door panels fold back on themselves
- **Use:** Closet doors, wardrobe access, room dividers
- **Characteristic:** Takes up less swing space than traditional doors; panels fold against walls

### Sliding Door
**Symbol:** Two rectangles side-by-side with arrows indicating horizontal movement
- **Visual:** Doubled door lines with left and right arrows
- **Meaning:** Two panels that slide horizontally past each other
- **Use:** Patio doors, large glass doors, room dividers
- **Characteristic:** One panel typically stationary, one mobile; allows wide openings

### Accordion Door
**Symbol:** Multiple zigzag fold lines in connected panels
- **Visual:** Many connected segments in a pleated pattern with arrows showing accordion motion
- **Meaning:** Multiple panels fold like an accordion
- **Use:** Large wardrobe closets, room dividers, utility access
- **Characteristic:** Can open the full width of the opening; takes minimal swing space

---

## Part 3: Wall & Structural Elements

### Walls
- **Thick Black Lines (≥2mm):** Load-bearing walls or solid exterior walls
- **Thin Black Lines:** Interior non-load-bearing walls or partition walls
- **Double Lines:** Exterior walls (showing wall thickness)

### Doors in Walls
- Doors are shown at the wall opening where they're located
- The arc or symbol indicates the swing/operation direction relative to the room
- Door width is typically marked in the opening

### Windows
- **Symbol:** Square or rectangular shapes with cross-hatching or double lines in the wall
- **Location:** Usually on exterior walls
- **Markings:** Window dimensions provided separately (e.g., "4'-0" × 5'-0"")

### Openings & Thresholds
- **Open Concept:** No door or wall symbol; just space indication
- **Partial Wall:** Thick line segment with opening
- **Threshold:** Sometimes marked with a thin line between rooms

---

## Part 4: Spatial Relationships & Layout

### Reading Adjacency
- Adjacent rooms share walls shown as continuous lines
- Room locations relative to each other show flow and circulation
- Door positions indicate primary entry points to each room

### Floor vs. Upper Levels
- Plans labeled "FIRST FLOOR PLAN" show ground level layout
- Plans labeled "SECOND FLOOR PLAN" show upper level layout
- Staircase symbols (#+) indicate vertical circulation between levels

### Dimensions & Scale
- **Scale Notation:** Typically "1:50" or "1:100" (1 unit on plan = 50/100 units actual)
- **Scale Bar:** Visual reference line marked with measurements (e.g., "0' 2' 5' 10' 20'")
- **Room Dimensions:** Provided in square meters (m²) or feet (ft²)
- **Individual Measurements:** Specific openings and features labeled with actual dimensions

### Overall Building Dimensions
- Exterior measurements shown on outer edges (e.g., "120'-0"" × "85'-6"")
- Used to verify total floor area and overall proportions

---

## Part 5: Reproduction Checklist

To accurately reproduce a floor plan, verify the following:

### Basic Structure
- [ ] Overall dimensions and scale match
- [ ] Exterior walls (double lines) properly positioned
- [ ] Interior walls in correct locations and thickness
- [ ] Room shapes (rectangles, L-shapes, irregular) replicated

### Rooms & Labels
- [ ] All numbered rooms identified correctly
- [ ] Room dimensions noted and proportional
- [ ] Room labels placed appropriately

### Doors
- [ ] Every door location marked
- [ ] Door type correctly identified (single swing, double swing, pocket, bifold, sliding, accordion)
- [ ] Door swing direction shown with correct arc or symbol
- [ ] Door widths accurate to scale

### Vertical Elements
- [ ] Stairs marked with symbol and direction
- [ ] Staircases positioned between floor levels correctly
- [ ] Landings and treads indicated

### Additional Features
- [ ] Windows positioned on exterior walls
- [ ] Window types and sizes noted
- [ ] Closets and built-ins shown
- [ ] Mechanical elements (HVAC, fixtures) positioned
- [ ] Dimensions provided for key measurements

### Annotation
- [ ] Scale clearly marked
- [ ] Dimension line locations and values accurate
- [ ] Room labels numbered per legend
- [ ] Floor level identified (First Floor, Second Floor, etc.)

---

## Part 6: Example Analysis Process

### Step 1: Identify Overall Layout
"This is a two-story residential plan. First floor has open living/dining, kitchen, master suite. Second floor has bedrooms and bathrooms."

### Step 2: Map Rooms
"First floor contains: Foyer (1), Living/Dining (2), Library (3), Breakfast (4), Kitchen (5), Mudroom (6), Garage (7)"

### Step 3: Identify Door Types
- "Door from Kitchen to Foyer: Single swing, swings into kitchen"
- "Door from Living Room to Dining: Open concept (no door)"
- "Master Bedroom closet: Bifold door"
- "Patio access: Sliding glass door"

### Step 4: Verify Spatial Flow
"Circulation flows from Foyer → Kitchen → Living/Dining. Garage accessible from Mudroom. Master Suite private with attached bath."

### Step 5: Confirm Dimensions
"Master Bedroom: [Width] × [Depth] per scale; Kitchen: 108.78 m²; overall building 120'-0" × 85'-6""

---

---

## Part 8: Dynamic Room Type Configuration (App Integration)

### Overview
This section explains how the AI agent integrates with the application's dynamic room configuration system, allowing users to define custom room types for their specific facility or project.

### Variable Format & Structure

The application provides room type mappings through a `ROOM_LEGEND` variable or object. The AI agent must check for this before processing any floor plan.

#### Format 1: Object/Dictionary Mapping
```javascript
{
  "ROOM_LEGEND": {
    "1": "Classroom",
    "2": "Science Lab",
    "3": "Computer Lab",
    "4": "Hallway",
    "5": "Administrative Office",
    "6": "Staff Room",
    "7": "Gymnasium",
    "8": "Cafeteria"
  }
}
```

#### Format 2: Array Mapping
```javascript
{
  "ROOM_LEGEND": [
    { "id": "1", "name": "Classroom" },
    { "id": "2", "name": "Science Lab" },
    { "id": "3", "name": "Computer Lab" }
  ]
}
```

#### Format 3: Inline Plan Legend
```
FIRST FLOOR PLAN
Legend:
1. Recording Studio
2. Control Room
3. Vocal Booth
4. Equipment Storage
```

#### Format 4: Metadata File
```
{
  "floorPlan": "school_layout.svg",
  "roomLegend": {
    "type": "educational",
    "mapping": {
      "101": "Classroom_Grade1",
      "102": "Classroom_Grade2",
      "103": "Science Lab",
      "104": "Art Studio"
    }
  }
}
```

### AI Agent Processing Algorithm

When an AI agent receives a floor plan, it must follow this hierarchy:

**Step 1: Check for Dynamic ROOM_LEGEND**
```
IF "ROOM_LEGEND" variable exists in input
  THEN use this as the authoritative mapping
  ELSE proceed to Step 2
```

**Step 2: Check for On-Plan Legend**
```
IF floor plan contains a visible legend section
  THEN extract room number → name mappings
  ELSE proceed to Step 3
```

**Step 3: Check for Metadata/Context**
```
IF metadata object contains room definitions
  THEN apply those mappings
  ELSE proceed to Step 4
```

**Step 4: Apply Standard Fallback**
```
IF room number exists in standard legend (1-62)
  THEN use standard room type
  ELSE mark as "CUSTOM_ROOM" and flag for clarification
```

### Implementation Examples

#### Example 1: Healthcare Facility
```
Input: {
  "planType": "hospital",
  "ROOM_LEGEND": {
    "101": "Emergency Department",
    "102": "Triage",
    "103": "X-Ray Lab",
    "104": "Surgical Suite",
    "105": "Recovery Room",
    "106": "Patient Waiting",
    "107": "Pharmacy"
  }
}

Floor plan shows: Room 103

AI Processing:
1. Checks ROOM_LEGEND → finds "103": "X-Ray Lab"
2. Applies label "X-Ray Lab" to room 103
3. NOT "Laboratory (Medical)" - uses exact provided name
```

#### Example 2: Manufacturing Facility
```
Input: {
  "planType": "manufacturing",
  "ROOM_LEGEND": {
    "A1": "Assembly Line 1",
    "A2": "Assembly Line 2",
    "QA": "Quality Assurance",
    "WH": "Warehouse",
    "LD": "Loading Dock",
    "OFF": "Administrative Office"
  }
}

Floor plan shows: Room A1, Room QA

AI Processing:
1. Checks ROOM_LEGEND → finds "A1": "Assembly Line 1", "QA": "Quality Assurance"
2. Applies exact custom labels (not standard types)
3. Handles alphanumeric room codes correctly
```

#### Example 3: School (Multiple Floor Levels)
```
Input: {
  "facilityType": "school",
  "buildingName": "Science Building",
  "ROOM_LEGEND": {
    "S101": "Biology Lab",
    "S102": "Chemistry Lab",
    "S103": "Physics Lab",
    "S104": "Prep Room",
    "S105": "Storage",
    "C201": "Classroom A",
    "C202": "Classroom B",
    "C203": "Classroom C"
  }
}

Floor plan (First Floor) shows: S101, S102, S104

AI Processing:
1. Matches S101 → "Biology Lab"
2. Matches S102 → "Chemistry Lab"
3. Matches S104 → "Prep Room"
4. Maintains consistency across all floor plans (S = Science, C = Classroom)
```

### Handling Edge Cases

#### Case 1: Partial Legend Provided
```
If ROOM_LEGEND provides:
  "1": "Chemistry Lab"
  "2": "Biology Lab"

But floor plan contains room "3" (not in legend):
  
Action: 
  1. Check standard legend for "3" → finds "LIBRARY"
  2. Flag as potential mismatch
  3. Use "LIBRARY" as best-guess
  4. Notify user to clarify room "3"
```

#### Case 2: Custom Naming Convention
```
If ROOM_LEGEND uses format:
  "CLASSROOM-1A": "Advanced Physics"
  "CLASSROOM-1B": "General Chemistry"
  "LAB-MAIN": "Central Lab"

Action:
  1. Handle non-numeric room IDs
  2. Match text labels on plan exactly
  3. Apply custom names as-is
  4. Maintain naming convention in reproduction
```

#### Case 3: Mixed Standard & Custom
```
If ROOM_LEGEND provides:
  "1": "KITCHEN" (standard)
  "2": "CUSTOM_MEDITATION_SPACE"

Action:
  1. Apply provided mapping for both
  2. Standard and custom coexist
  3. Use exact names provided
```

#### Case 4: Duplicate Room Numbers Across Floors
```
If both First Floor and Second Floor have room "101":
  Input must also specify floor level:
  {
    "ROOM_LEGEND": {
      "first_floor": { "101": "Classroom" },
      "second_floor": { "101": "Office" }
    }
  }

Action:
  1. Apply floor-specific mappings
  2. Mark room with floor designation
  3. Reproduce as "First Floor - Classroom 101"
```

### User Input Integration Points

#### Point 1: Room Type Selection
```
App UI: User selects facility type from dropdown
Options: Residential, School, Hospital, Office, Manufacturing, etc.

AI Agent Receives:
{
  "facilityType": "school",
  "ROOM_LEGEND": { ... }
}
```

#### Point 2: Custom Room Entry
```
App UI: User manually enters custom room definitions
Input Fields:
  Room ID: "LAB-01"
  Room Name: "Biotechnology Lab"
  Room Type: "Laboratory"
  Floor: "Second Floor"

AI Agent Receives:
{
  "ROOM_LEGEND": {
    "LAB-01": "Biotechnology Lab"
  },
  "customDefinitions": true
}
```

#### Point 3: Import/Upload
```
App UI: User uploads CSV or JSON with room definitions
File Format (CSV):
  RoomID, RoomName, RoomType, Floor
  101, Chemistry Lab, Lab, First
  102, Biology Lab, Lab, First

File Format (JSON):
  { "ROOM_LEGEND": { "101": "Chemistry Lab", ... } }

AI Agent Receives:
{
  "ROOM_LEGEND": { ... },
  "source": "imported"
}
```

### Reproduction with Dynamic Rooms

When reproducing a floor plan that uses dynamic room types:

1. **Extract all room labels** from the plan
2. **Map each label to ROOM_LEGEND** to get the actual name
3. **Reproduce the plan structure** with walls, doors, dimensions
4. **Apply custom room names** instead of standard types
5. **Preserve special naming conventions** (e.g., "LAB-01" not "Laboratory 1")
6. **Maintain floor-level accuracy** if multi-story

#### Reproduction Example:
```
Original Plan Input:
{
  "floorPlan": "school.svg",
  "floor": "First",
  "ROOM_LEGEND": {
    "101": "Classroom (Grade 3)",
    "102": "Classroom (Grade 4)",
    "103": "Art Studio",
    "104": "Music Room",
    "105": "Gymnasium"
  }
}

AI Reproduction Output:
[
  { "roomID": "101", "name": "Classroom (Grade 3)", "location": "Northwest corner", "doors": 1 },
  { "roomID": "102", "name": "Classroom (Grade 4)", "location": "Adjacent to 101", "doors": 1 },
  { "roomID": "103", "name": "Art Studio", "location": "Central", "doors": 2 },
  { "roomID": "104", "name": "Music Room", "location": "East wing", "doors": 1 },
  { "roomID": "105", "name": "Gymnasium", "location": "South", "doors": 3 }
]
```

### Validation Checklist for Dynamic Rooms

When processing a floor plan with dynamic room types:

- [ ] ROOM_LEGEND variable located and parsed
- [ ] All room IDs on plan found in ROOM_LEGEND
- [ ] Custom room names extracted correctly
- [ ] Floor-level assignments honored (if multi-story)
- [ ] Room type naming conventions preserved
- [ ] No standard fallbacks applied unless necessary
- [ ] Unmapped rooms flagged for user review
- [ ] Reproduction uses exact custom names provided

### API Integration Pattern

For app developers integrating the AI agent:

```javascript
// Prepare floor plan with dynamic legend
const floorPlanData = {
  id: "school_floor_1",
  imageData: planImage,
  ROOM_LEGEND: userDefinedLegend,  // Dynamic from app UI
  metadata: {
    facilityType: "educational",
    buildingName: "Science Wing",
    floorLevel: "First Floor"
  }
};

// Pass to AI agent
const analysis = await aiAgent.analyzeFloorPlan(floorPlanData);

// Returns
{
  rooms: [
    { id: "101", name: "Biology Lab", area: "150 sqft", doors: [...] },
    { id: "102", name: "Chemistry Lab", area: "150 sqft", doors: [...] },
    ...
  ],
  reproductionData: { ... }
}
```

---

## Part 9: Quick Reference: Extended Room Types

| Door Type | Symbol | Characteristic | Common Use |
|-----------|--------|-----------------|-----------|
| **Single Swing** | Single arc from hinge | Opens one direction | Bedrooms, bathrooms, closets |
| **Double Swing** | Double arcs meeting center | Opens both directions | Kitchens, corridors |
| **Pocket** | Dashed line in wall | Slides into wall cavity | Tight spaces, modern design |
| **Bifold** | Accordion fold lines at center | Folds back on itself | Closets, wardrobes |
| **Sliding** | Doubled rectangles with arrows | Slides horizontally | Patios, glass doors, dividers |
| **Accordion** | Multiple zigzag pleats | Expands like accordion | Large closets, room dividers |

---

## Part 10: Common Mistakes to Avoid

1. **Confusing door swing direction** – Always trace the arc to see which room the door opens into
2. **Missing wall thickness** – Exterior walls are thicker than interior partitions
3. **Misidentifying open concept** – No wall line = open space, not a closed room
4. **Incorrect scale application** – Always use the scale bar, not guessing proportions
5. **Overlooking pocket doors** – Dashed lines in walls indicate sliding/pocket doors, not solid walls
6. **Door size mismatches** – Dimension labels must align with visual door width
7. **Forgetting vertical circulation** – Stairs must connect properly between floors
8. **Ignoring room labels** – Each numbered room must be correctly identified per legend

---

## Part 11: Testing Understanding

When analyzing a new floor plan, an AI agent should be able to answer:

1. How many rooms are on this floor?
2. What is the primary circulation path from entry to kitchen?
3. Identify every door and classify its type.
4. Which rooms have direct exterior access?
5. What is the largest room by area?
6. How does the upper floor relate spatially to the lower floor?
7. What is the overall square footage/area?
8. Are there any unusual or specialty spaces?
9. Reproduce the plan layout accurately based on the guide.

---

## Conclusion

By mastering this legend and reference system, an AI agent can:
- ✅ Read and interpret any standard architectural floor plan
- ✅ Identify rooms, spaces, and their functions
- ✅ Classify door types and swing directions
- ✅ Understand spatial flow and circulation
- ✅ Reproduce floor plans with accuracy
- ✅ Extract and verify dimensional data
- ✅ Communicate architectural information clearly

This guide is self-contained and sufficient for an AI to analyze new floor plans independently.
