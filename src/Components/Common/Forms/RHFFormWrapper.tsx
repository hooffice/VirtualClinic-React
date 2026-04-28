import React from "react";
import {
  FormProvider,
  UseFormReturn,
  FieldValues,
  SubmitHandler
} from "react-hook-form";
import { Form } from "reactstrap";

interface RHFFormWrapperProps<T extends FieldValues> {
  methods: UseFormReturn<T>;
  onSubmit: SubmitHandler<T>;
  children: React.ReactNode;
}

export function RHFFormWrapper<T extends FieldValues>({
  methods,
  onSubmit,
  children,
}: RHFFormWrapperProps<T>) {
  return (
    <FormProvider {...methods}>
      <Form onSubmit={methods.handleSubmit(onSubmit)}>
        {children}
      </Form>
    </FormProvider>
  );
}