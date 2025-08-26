"use client";
import { useState, useRef } from "react"; // Add useRef here
import Button from "@/components/Button";
import * as yup from "yup";
import { Controller } from "react-hook-form";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import axios from "axios";
import { APIURL } from "../../../../configs/api";
import { useAuth } from "../../../../context/AuthContext";

export default function Modal_Rejeter_Reservation({
  onClose,
  code_reservation,
  id,
}) {
  const [loading, setLoading] = useState({ form: false });
  const [display_form, set_dislay_form] = useState(false);
  const [backendErrors, setBackendErrors] = useState(null);
  const { token } = useAuth();
  const accessToken = token || localStorage.getItem("accessToken");

  const TextField = ({
    label,
    name,
    type = "text",
    required = false,
    control,
    errors,
    width = "w-full",
    height = "h-10",
    disabled = false,
    isTextarea = false, // New prop for handling textareas
  }) => {
    return (
      <div className="mb-4">
        <label
          htmlFor={name}
          className="block text-sm font-medium !text-gray-700"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <Controller
          name={name}
          control={control}
          render={({ field }) =>
            // Conditionally render input or textarea
            isTextarea ? (
              <textarea
                style={{ marginLeft: "-10px!important" }}
                {...field}
                id={name}
                name={name}
                className={`block ${width} ${height} px-3 py-2 mt-1 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                  errors[name] ? "border-red-500" : ""
                }`}
                disabled={disabled}
                required={required}
                value={field.value || ""}
                onChange={(e) => field.onChange(e.target.value)} // Ensure React Hook Form handles the change
              />
            ) : (
              <input
                {...field}
                id={name}
                name={name}
                type={type}
                className={`block ${width} ${height} px-3 py-2 mt-1 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                  errors[name] ? "border-red-500" : ""
                }`}
                required={required}
                disabled={disabled}
                value={field.value || ""}
                onChange={(e) => field.onChange(e.target.value)} // Ensure React Hook Form handles the change
              />
            )
          }
        />
        {errors[name] && (
          <div className="mt-1 text-xs !text-red-600">
            <p>{errors[name]?.message}</p>
          </div>
        )}
      </div>
    );
  };

  const defaultValues = {
    commentaire_res: "",
    statut_res: 2,
    with_avance: 0,
  };

  const validationSchema = yup.object().shape({
    commentaire_res: yup.string().required("Le commentaire est requis"),
  });

  const validationSchemaRef = useRef(validationSchema);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(validationSchemaRef.current),
    defaultValues: {
      commentaire_res: "", // or whatever default value you want
      ...defaultValues, // Spread your existing default values
    },
  });
  //REJETER RESERVATION

  const onSubmit = (data) => {
    setLoading({ ...loading, form: true });

    axios({
      method: "put",
      url: `${APIURL.ROOTV1}/traiter_reservation/${Number(id)}`,
      data: data,
      headers: {
        "content-type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    })
      .then(() => {
        setLoading({ ...loading, form: false });

        onClose(), toast.success("Réservation Traitée avec succès");
        localStorage.setItem("load_data_reservation", 1);
      })
      .catch(() => {
        console.log("err");
        setLoading({ ...loading, form: false });
      });
  };

  return (
    <>
      <div className="w-full max-w-[90%] sm:max-w-[500px] md:max-w-[600px] lg:max-w-[800px] h-auto bg-white flex flex-col mx-auto">
        <div className="w-full h-[60px] bg-red-600 px-4">
          <div className="flex items-center justify-center h-full">
            <h1 className="text-3xl font-bold text-center text-white">
              Rejet Réservation
            </h1>
          </div>
        </div>

        <div className="p-4 w-[600px] ">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="mt-4 mx-auto w-full max-w-[360px] flex flex-col items-center"
          >
            <div className="flex flex-col items-center justify-center w-full ">
              <div className="w-full max-w-md">
                {
                  <>
                    <TextField
                      label="Commentaire :"
                      name="commentaire_res"
                      required={true}
                      control={control}
                      errors={errors}
                      isTextarea={true} // Specify it's a textarea
                      height="h-24"
                      width="w-full"
                      onChange={(e) => {
                        console.log("comment=>" + e);
                        setValue("commentaire_res", e);
                      }} // Optional: Change height for textarea
                    />
                  </>
                }
              </div>
            </div>

            <div className="w-full">
              {backendErrors != null && (
                <p className="!text-red-600 text-sm mb-2">{backendErrors}</p>
              )}
            </div>
            <div className="flex justify-end gap-2 mt-[10%]">
              <Button type="button" onClick={onClose}>
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={loading.form}
                loading={loading.form}
              >
                Enregistrer
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
