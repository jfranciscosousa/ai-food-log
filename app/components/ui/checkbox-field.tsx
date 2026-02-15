import { Checkbox as CheckboxPrimitive } from "@base-ui/react/checkbox";

import get from "lodash/get";
import { useId } from "react";
import { cn } from "~/utils";
import { Checkbox } from "./checkbox";

export interface CheckboxFieldProps extends CheckboxPrimitive.Root.Props {
  label: string;
  name: string;
  errors?: Record<string, string> | null;
  inputClassName?: string;
  ref?: React.Ref<HTMLButtonElement>;
}

function CheckboxField({
  errors,
  name,
  label,
  inputClassName,
  className,
  ref,
  ...props
}: CheckboxFieldProps) {
  const reactId = useId();
  const id = props.id || reactId;
  const errorMessage = get(errors, name);

  return (
    <div className={cn("items-top flex space-x-2 pb-4", className)}>
      <Checkbox
        {...props}
        className={inputClassName}
        ref={ref}
        id={id}
        name={name}
      />
      <div className="grid gap-1.5 leading-none">
        <label
          htmlFor={id}
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          {label}
        </label>
      </div>

      {errorMessage && <p className="pt-4 text-red-500">{errorMessage}</p>}
    </div>
  );
}

export { CheckboxField };
