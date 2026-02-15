import type { Meta, StoryObj } from "@storybook/react-vite";
import { MemoryRouter } from "react-router";
import { ErrorComponent } from "./Error500Page";

const meta = {
  title: "Pages/Error500Page",
  component: ErrorComponent,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
  ],
  argTypes: {
    errorCode: {
      control: "number",
    },
    message: {
      control: "text",
    },
  },
} satisfies Meta<typeof ErrorComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    errorCode: 500,
    message:
      "We're experiencing some technical issues on our end. Please try again later or go back to the previous page.",
  },
};

export const ServerError: Story = {
  args: {
    errorCode: 500,
    message: "Internal server error. Our team has been notified.",
  },
};

export const ServiceUnavailable: Story = {
  args: {
    errorCode: 503,
    message:
      "Service temporarily unavailable. We're working on it. Please check back soon.",
  },
};

export const Forbidden: Story = {
  args: {
    errorCode: 403,
    message: "You don't have permission to access this resource.",
  },
};
