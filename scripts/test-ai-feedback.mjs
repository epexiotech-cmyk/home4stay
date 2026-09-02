import { prisma } from "../apps/main-site/src/lib/database/prisma.ts";
import { 
  calculateEditDistancePercent, 
  AiIntelligenceService 
} from "../apps/main-site/src/lib/ai/intelligence.ts";

/**
 * AI Feedback & Hospitality Intelligence Test Runner
 */
async function runTests() {
  console.log("=== 🚀 RUNNING PHASE 4B: AI FEEDBACK INTELLIGENCE TEST SUITE ===\n");
  
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(` ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(` ❌ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    // --------------------------------------------------
    // TEST 1: Levenshtein Edit Distance Calculation
    // --------------------------------------------------
    console.log("--------------------------------------------------");
    console.log("TEST 1: Edit Distance Levenshtein Analytics");
    console.log("--------------------------------------------------");
    
    const d1 = calculateEditDistancePercent("Luxury mountain cabin", "Luxury mountain cabin");
    assert(d1 === 0, `0% edited on identical texts (got ${d1}%)`);

    const d2 = calculateEditDistancePercent("Luxury mountain cabin", "Luxury mountain chalet");
    // "cabin" (5 chars) vs "chalet" (6 chars). Max length 22 (with "Luxury mountain "). 
    // Distance between cabin and chalet is 4. (4 / 22) * 100 = 18.18%
    assert(d2 > 0 && d2 < 30, `Partially edited calculates correctly (got ${d2}%)`);

    const d3 = calculateEditDistancePercent("Alpine Snow", "");
    assert(d3 === 100, `Empty final output calculates as 100% edited (got ${d3}%)`);

    // --------------------------------------------------
    // Setup Mock Property for Db Tenant Checks
    // --------------------------------------------------
    const mockProperty1 = await prisma.property.findFirst();
    if (!mockProperty1) {
      throw new Error("No properties found in database. Seed property required first.");
    }
    const propId1 = mockProperty1.id;
    const propId2 = "00000000-0000-0000-0000-000000000000"; // Simulated distinct property

    // --------------------------------------------------
    // TEST 2: Log AI Generation Event
    // --------------------------------------------------
    console.log("\n--------------------------------------------------");
    console.log("TEST 2: Log AI Generation Event");
    console.log("--------------------------------------------------");
    
    const eventId = await AiIntelligenceService.logGeneration({
      propertyId: propId1,
      generationType: "PROPERTY_DESCRIPTION",
      inputContext: { propertyType: "alpine", location: "Alps", vibeKeywords: "snow, cozy" },
      generatedOutput: { tagline: "Where mountain serenity meets luxury", description: "Sensory peaks description..." },
      selectedTheme: "alpine",
      stepContext: "GENERATE_DESCRIPTION",
      durationMs: 820
    });

    assert(eventId !== null, "AI Generation event created and returned unique ID");

    const savedEvent = await prisma.aiGenerationEvent.findUnique({
      where: { id: eventId }
    });

    assert(savedEvent !== null, "Generation event retrieved from database successfully");
    assert(savedEvent.propertyId === propId1, "Event maps securely to correct propertyId");
    assert(savedEvent.generationDuration === 820, "Simulation duration milliseconds stored accurately");

    // --------------------------------------------------
    // TEST 3: Track Preference Signal
    // --------------------------------------------------
    console.log("\n--------------------------------------------------");
    console.log("TEST 3: Preference Signal Harvesting");
    console.log("--------------------------------------------------");
    
    const signal = await prisma.aiPreferenceSignal.findUnique({
      where: {
        propertyId_category_signalKey: {
          propertyId: propId1,
          category: "tone",
          signalKey: "mountain_wellness_sunrise"
        }
      }
    });

    assert(signal !== null && signal.score >= 1.0, "Implicit mountain preference signal harvested successfully");

    // --------------------------------------------------
    // TEST 4: Accepted Suggestion (0% Edit Distance)
    // --------------------------------------------------
    console.log("\n--------------------------------------------------");
    console.log("TEST 4: Feedbacks Tracking - Accepted Unchanged");
    console.log("--------------------------------------------------");

    const acceptSuccess = await AiIntelligenceService.recordFeedback({
      propertyId: propId1,
      eventId,
      action: "accept",
      savedOutput: savedEvent.generatedOutput
    });

    assert(acceptSuccess === true, "RECORD_FEEDBACK returns success response for accept");

    const acceptedEvent = await prisma.aiGenerationEvent.findUnique({
      where: { id: eventId }
    });

    assert(acceptedEvent.accepted === true, "Event state marked accepted = true");
    assert(acceptedEvent.edited === false, "Event state marked edited = false");
    assert(acceptedEvent.editDistance === 0.0, "Accept reports exactly 0.0% edit distance");

    // --------------------------------------------------
    // TEST 5: Partially Edited Copy Feedback
    // --------------------------------------------------
    console.log("\n--------------------------------------------------");
    console.log("TEST 5: Feedbacks Tracking - Partially Edited");
    console.log("--------------------------------------------------");

    const editedOutput = { 
      tagline: "Where mountain serenity meets luxury", 
      description: "Sensory peaks description... fully modified with alpine wooden terraces!" 
    };

    const editSuccess = await AiIntelligenceService.recordFeedback({
      propertyId: propId1,
      eventId,
      action: "edit",
      savedOutput: editedOutput
    });

    assert(editSuccess === true, "RECORD_FEEDBACK returns success for edit");

    const editedEvent = await prisma.aiGenerationEvent.findUnique({
      where: { id: eventId }
    });

    assert(editedEvent.accepted === false, "Edited event accepted state resolves to false");
    assert(editedEvent.edited === true, "Edited event edited state resolves to true");
    assert(editedEvent.editDistance > 0 && editedEvent.editDistance < 50, `Calculated exact Levenshtein edit percent (got ${editedEvent.editDistance}%)`);

    // --------------------------------------------------
    // TEST 6: Tenant Security and Cross-Property Lockout
    // --------------------------------------------------
    console.log("\n--------------------------------------------------");
    console.log("TEST 6: Tenant Security Cross-Property Protection");
    console.log("--------------------------------------------------");

    // Attacker attempts to edit mockProperty1's event using mockProperty2's token (propId2)
    const attackSuccess = await AiIntelligenceService.recordFeedback({
      propertyId: propId2, // Attacker property context
      eventId,
      action: "accept",
      savedOutput: savedEvent.generatedOutput
    });

    assert(attackSuccess === false, "Prisma proxy securely blocks cross-property telemetry modification updates");

    // Clean up test events from database to maintain pristine production state
    await prisma.aiGenerationEvent.delete({ where: { id: eventId } });
    console.log("\n🧹 Database telemetry logs cleaned up successfully.");

  } catch (error) {
    console.error("\n❌ Global test error occurred:", error);
    failed++;
  }

  console.log("\n==================================================");
  console.log(`🏁 TEST REPORT: Passed ${passed} | Failed ${failed}`);
  console.log("==================================================");

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests();
