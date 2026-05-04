import React, { useEffect, useState } from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Spinner,
  Row,
  Col,
} from "reactstrap";
import { useForm, FormProvider } from "react-hook-form";
import clinicianService from "@/services/admin/clinician/clinicianService";
import { RHFInput } from "@/Components/Common/Forms";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const getSchema = (isResetPassword: boolean) =>
  z.object({
    userName: z.string().optional(),

    newUsername: !isResetPassword
      ? z.string().optional()
      : z.string().min(3, "Username is required"),

    password: isResetPassword
      ? z.string().min(6, "Password must be at least 6 characters")
      : z.string().optional(),
  });

interface ResetUserModalProps {
  isOpen: boolean;
  toggle: () => void;
  clinicianId: number;
  userId: number;
  identityId: string;
  userName: string;
  isResetPassword: boolean;
  onSuccess?: () => void;
}

interface FormValues {
  userName: string;
  newUsername?: string;
  password?: string;
}

const ResetUserModal: React.FC<ResetUserModalProps> = ({
  isOpen,
  toggle,
  identityId,
  userName,
  isResetPassword,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);

  const methods = useForm<FormValues>({
    mode: "onChange",
    resolver: zodResolver(getSchema(isResetPassword)),
  });

  const {
    handleSubmit,
    formState: { isValid },
  } = methods;

  // Prefill old username
  useEffect(() => {
    methods.reset({
      userName,
      newUsername: "",
      password: "",
    });
  }, [isOpen, isResetPassword]);

  const onSubmit = async (data: FormValues) => {
    try {
      setLoading(true);
      if (!isResetPassword) {
        await clinicianService.changeUserName({
          identityId: identityId,
          userName: data.newUsername ?? "",
        });
      }else
      {
        await clinicianService.changePassword({
          identityId: identityId,
          password: data.password ?? "",
        });        
      }
      onSuccess?.();
      toggle();
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormProvider {...methods}>
      <Modal isOpen={isOpen} toggle={toggle} centered>
        <ModalHeader toggle={toggle}>Reset Username</ModalHeader>

        <ModalBody>
          <Row>
            <Col sm={12}>
              <RHFInput label="Old Username" name="userName" disabled />
            </Col>
          </Row>
          {!isResetPassword && (
            <>
              <Row>
                <Col sm={12}>
                  <RHFInput label="New Username" name="newUsername" required />
                </Col>
              </Row>
            </>
          )}
          {isResetPassword && (
            <>
              <Row>
                <Col sm={12}>
                  <RHFInput type="password" label="Password" name="password" />
                </Col>
              </Row>
            </>
          )}
        </ModalBody>

        <ModalFooter>
          <Button color="secondary" onClick={toggle} disabled={loading}>
            Cancel
          </Button>

          <Button
            color="primary"
            onClick={handleSubmit(onSubmit)}
            disabled={!isValid || loading}
          >
            {loading ? <Spinner size="sm" /> : "Save"}
          </Button>
        </ModalFooter>
      </Modal>
    </FormProvider>
  );
};

export default ResetUserModal;
