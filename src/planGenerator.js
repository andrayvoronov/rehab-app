export const TEST_MODE = true;

export function generatePlan(patient) {
  if (TEST_MODE) {
    return {
      summary: `Test plan for ${patient.name}:  
- Phase: ${patient.phase}  
- Condition: ${patient.primaryCondition}  
- Sport: ${patient.sport}  
Generated locally without API.`,
    };
  }

  return {
    summary: "LLM plan goes here later.",
  };
}
