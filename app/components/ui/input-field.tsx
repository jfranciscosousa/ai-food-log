import get from "lodash/get";
import { useId } from "react";
import type { ComponentPropsWithRef } from "react";
import { cn } from "~/utils";
import { Input } from "./input";
import { Label } from "./label";

export interface InputFieldProps extends ComponentPropsWithRef<"input"> {
  label: string;
  name: string;
  errors?: Record<string, string> | null;
  inputClassName?: string;
  ref?: React.Ref<HTMLInputElement>;
}

function InputField({
  errors,
  name,
  label,
  className,
  inputClassName,
  ref,
  ...props
}: InputFieldProps) {
  const reactId = useId();
  const id = props.id || reactId;
  const errorMessage = get(errors, name);

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <Label htmlFor={id}>{label}</Label>

      <Input
        ref={ref}
        id={id}
        name={name}
        className={cn("input w-full", inputClassName)}
        {...props}
      />

      {errorMessage && <p className="text-red-500">{errorMessage}</p>}
    </div>
  );
}

export { InputField };
