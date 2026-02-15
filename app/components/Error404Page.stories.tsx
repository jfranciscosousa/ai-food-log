import type { Meta, StoryObj } from "@storybook/react-vite";
import { MemoryRouter } from "react-router";
import Error404Page from "./Error404Page";

const meta = {
  title: "Pages/Error404Page",
  component: Error404Page,
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
} satisfies Meta<typeof Error404Page>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
