import get from "lodash/get";
import { useId } from "react";
import { cn } from "~/utils";
import { Label } from "./label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";

export interface InputFieldProps {
  label: string;
  name: string;
  errors?: Record<string, string> | null;
  className?: string;
  options: { label: string; value: string }[];
  placeholder?: string;
  required?: boolean;
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string | null) => void;
}

const SelectField = ({
  errors,
  name,
  label,
  className,
  options,
  placeholder,
  required,
  defaultValue,
  value,
  onValueChange,
}: InputFieldProps) => {
  const reactId = useId();
  const id = reactId;
  const errorMessage = get(errors, name);

  return (
    <Label className={cn("flex flex-col gap-2 items-start", className)}>
      <span>{label}</span>

      <Select
        name={name}
        required={required}
        onValueChange={onValueChange}
        defaultValue={defaultValue}
        value={value}
      >
        <SelectTrigger
          id={id}
          className={cn(
            "input w-full",

            className,
          )}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {errorMessage && <p className="pt-4 text-red-500">{errorMessage}</p>}
    </Label>
  );
};

export { SelectField };
