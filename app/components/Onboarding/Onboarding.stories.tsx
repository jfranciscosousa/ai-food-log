import type { Meta, StoryObj } from "@storybook/react-vite";
import { Onboarding } from "./Onboarding";

const meta = {
  title: "app/Onboarding",
  component: Onboarding,
  parameters: {
    layout: "centered",
  },
  decorators: [
    (Story) => (
      <div style={{ width: "720px" }}>
        <Story />
      </div>
    ),
  ],
  tags: ["autodocs"],
  args: {
    onComplete: (data) => {
      console.log("Onboarding completed with data:", data);
    },
  },
} satisfies Meta<typeof Onboarding>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const Loading: Story = {
  args: {
    isLoading: true,
  },
};

export const WithErrorsStep1: Story = {
  args: {
    errors: {
      email: "Email is already taken",
      password: "Password must be at least 8 characters",
    },
  },
};

export const WithErrorsStep2: Story = {
  args: {
    errors: {
      age: "Age must be at least 18",
      weight: "Weight must be a valid number",
    },
  },
};

export const WithErrorsStep4: Story = {
  args: {
    errors: {
      inviteToken: "Invalid invite token",
    },
  },
};
