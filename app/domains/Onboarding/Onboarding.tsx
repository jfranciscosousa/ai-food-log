import { useState, useRef, useEffect } from "react";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "~/components/ui/card";
import { Progress } from "~/components/ui/progress";
import { Step1Welcome } from "./Steps/Step1Welcome";
import { Step2AboutYou } from "./Steps/Step2AboutYou";
import { Step3Goals } from "./Steps/Step3Goals";
import { Step4Complete } from "./Steps/Step4Complete";

export type Step1Data = {
  email: string;
  name: string;
  password: string;
  passwordConfirmation: string;
};

export type Step2Data = {
  gender: string;
  age?: number;
  height?: number;
  weight?: number;
};

export type Step3Data = {
  fitnessLevel: string;
  weightLossGoal: string;
  targetCalories?: number;
};

export type Step4Data = {
  inviteToken: string;
  rememberMe: boolean;
};

export type OnboardingData = Step1Data & Step2Data & Step3Data & Step4Data;

type OnboardingProps = {
  isLoading?: boolean;
  errors?: Record<string, string>;
  onComplete: (data: OnboardingData) => void;
  onExit?: () => void;
};

// Map field names to their step index
const fieldToStepMap: Record<string, number> = {
  email: 0,
  name: 0,
  password: 0,
  passwordConfirmation: 0,
  gender: 1,
  age: 1,
  height: 1,
  weight: 1,
  fitnessLevel: 2,
  weightLossGoal: 2,
  targetCalories: 2,
  inviteToken: 3,
  rememberMe: 3,
};

function getFirstErrorStep(errors?: Record<string, string>): number | null {
  if (!errors) return null;

  const errorFields = Object.keys(errors);
  if (errorFields.length === 0) return null;

  const errorSteps = errorFields
    .map((field) => fieldToStepMap[field])
    .filter((step) => step !== undefined)
    .sort((a, b) => a - b);

  return errorSteps[0] ?? null;
}

export function Onboarding({
  isLoading,
  errors,
  onComplete,
  onExit,
}: OnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [step1Data, setStep1Data] = useState<Step1Data>({
    email: "",
    name: "",
    password: "",
    passwordConfirmation: "",
  });
  const [step2Data, setStep2Data] = useState<Step2Data>({
    gender: "",
    age: undefined,
    height: undefined,
    weight: undefined,
  });
  const [step3Data, setStep3Data] = useState<Step3Data>({
    fitnessLevel: "",
    weightLossGoal: "",
    targetCalories: undefined,
  });
  const [step4Data, setStep4Data] = useState<Step4Data>({
    inviteToken: "",
    rememberMe: false,
  });

  const formRef = useRef<HTMLDivElement>(null);

  const totalSteps = 4;
  const progress = ((currentStep + 1) / totalSteps) * 100;

  const steps = [
    {
      title: "Welcome!",
      description: "Let's get started with your account",
    },
    {
      title: "About You",
      description: "Tell us about yourself",
    },
    {
      title: "Your Goals",
      description: "What would you like to achieve?",
    },
    {
      title: "Almost Done",
      description: "Just a few more details",
    },
  ];

  const firstErrorStep = getFirstErrorStep(errors);

  // Navigate to the first step with errors when errors are received
  useEffect(() => {
    if (firstErrorStep !== null && firstErrorStep !== currentStep) {
      setCurrentStep(firstErrorStep);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firstErrorStep]);

  const handleStep1Next = (data: Step1Data) => {
    setStep1Data(data);
    setCurrentStep(1);
  };

  const handleStep2Next = (data: Step2Data) => {
    setStep2Data(data);
    setCurrentStep(2);
  };

  const handleStep3Next = (data: Step3Data) => {
    setStep3Data(data);
    setCurrentStep(3);
  };

  const handleStep4Next = (data: Step4Data) => {
    setStep4Data(data);

    const completeData = {
      ...step1Data,
      ...step2Data,
      ...step3Data,
      ...data,
    };
    onComplete(completeData);
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    } else if (onExit) {
      onExit();
    }
  };

  const handleNextClick = () => {
    // Trigger the form submission by finding and clicking the hidden submit button
    if (formRef.current) {
      const submitButton = formRef.current.querySelector(
        'button[type="submit"]',
      );
      if (submitButton) {
        (submitButton as HTMLButtonElement).click();
      }
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <div className="mb-4">
          <Progress value={progress} className="h-2" />
          <div className="mt-2 flex justify-between text-xs text-muted-foreground">
            <span>
              Step {currentStep + 1} of {totalSteps}
            </span>
            <span>{Math.round(progress)}% complete</span>
          </div>
        </div>
        <CardTitle>{steps[currentStep].title}</CardTitle>
        <CardDescription>{steps[currentStep].description}</CardDescription>
      </CardHeader>

      <CardContent>
        <div className="space-y-6">
          <div ref={formRef}>
            {currentStep === 0 && (
              <Step1Welcome
                onNext={handleStep1Next}
                defaultValues={step1Data}
                errors={errors}
              />
            )}

            {currentStep === 1 && (
              <Step2AboutYou
                onNext={handleStep2Next}
                defaultValues={step2Data}
                errors={errors}
              />
            )}

            {currentStep === 2 && (
              <Step3Goals
                step2Data={step2Data}
                onNext={handleStep3Next}
                defaultValues={step3Data}
                errors={errors}
              />
            )}

            {currentStep === 3 && (
              <Step4Complete
                onNext={handleStep4Next}
                defaultValues={step4Data}
                errors={errors}
                summary={{
                  name: step1Data.name,
                  email: step1Data.email,
                  age: step2Data.age,
                  height: step2Data.height,
                  weight: step2Data.weight,
                }}
              />
            )}
          </div>

          <div className="flex justify-between pt-4">
            <Button type="button" variant="outline" onClick={handleBack}>
              Back
            </Button>

            <Button
              type="button"
              onClick={handleNextClick}
              isLoading={currentStep === totalSteps - 1 && isLoading}
            >
              {currentStep === totalSteps - 1 ? "Complete" : "Next"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
