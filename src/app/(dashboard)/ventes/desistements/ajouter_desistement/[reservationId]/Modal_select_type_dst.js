"use client";
import { useState, useRef } from "react";
import Button from "@/components/Button";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import SelectInput from "@/components/SelectInput";
import { type_dst } from "@/configs/enum";
export default function Modal_select_type_dst({ onSelect, onClose }) {
  const validationSchemaRef = useRef(
    yup.object().shape({
      type_dst: yup
        .string()
        .required("Veuillez sélectionner un type de désistement"),
    })
  );

  const {
    watch,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(validationSchemaRef.current),
    defaultValues: {
      type_dst: "",
    },
  });

  const [clickedDiv, setClickedDiv] = useState(false);
  const [hasValueChanged, setHasValueChanged] = useState(false);

  const onSubmit = (data) => {
    onSelect(data.type_dst);
  };

  const handleDivClick = () => {
    setClickedDiv(true);
    // You can add additional logic here if needed
  };

  const handleSelectChange = (value) => {
    if (watch("type_dst")) {
      setHasValueChanged(true);
    }
  };

  return (
    <div className="w-full max-w-[100%] sm:max-w-[500px] md:max-w-[600px] lg:max-w-[800px] h-auto bg-white flex flex-col mx-auto rounded-lg overflow-hidden">
      <div className="w-full h-[60px] bg-green-600 px-4">
        <div className="flex items-center justify-center h-full">
          <h1 className="text-xl md:text-2xl font-bold text-center text-white">
            Type de désistement
          </h1>
        </div>
      </div>

      <div className="p-6 w-full">
        <p>Veuillez Choisir un Type de Désistement :</p>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mx-auto w-full flex flex-col items-center"
        >
          <div
            className={`w-full max-w-md ${
              (clickedDiv && watch("type_dst") == "") || hasValueChanged
                ? "mb-20"
                : "mb-6"
            } transition-all duration-200`}
            onClick={handleDivClick}
          >
            <Controller
              name="type_dst"
              control={control}
              render={({ field: { onChange, ...restField } }) => (
                <div className="w-full">
                  <SelectInput
                    {...restField}
                    onChange={(value) => {
                      onChange(value);
                      handleSelectChange(value);
                    }}
                    options={Object.values(type_dst).map((status) => ({
                      value: status.id,
                      label: status.label,
                    }))}
                    placeholder="Choisir un type de désistement"
                    className="text-base w-full"
                    menuClassName="min-w-full"
                    error={errors.type_dst?.message}
                  />
                  {errors.type_dst && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.type_dst.message}
                    </p>
                  )}
                </div>
              )}
            />
          </div>

          <div className="flex justify-end gap-4 w-full max-w-md">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              className="px-6 py-2"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              className="px-6 py-2 bg-green-600 hover:bg-green-700"
            >
              Continuer
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
