return (
        <div className="container w-[800px] h-[500px]">
            {/* background */}
            <div className=" relative h-[25%] bg-gradient-to-r from-[#74EBD5] to-[#9FACE6] w-full ">
                <div className="flex items-center justify-center h-full">
                    <h1 className="text-2xl font-bold text-white">{societe && societe.raison_sociale}</h1>
                </div>
                <div className="bg-white w-[220px] h-[35vh]  absolute top-10 ml-6 shadow-xl rounded-tr-[40px] rounded-bl-[40px]">
                <img 
                        src={societe?.logo 
                            ? `${RESOURCE_URL.DOCS}/${societe.raison_sociale.replace(/\s+/g, "_")}_${societe.id}/logos/${societe.logo}`
                            : 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png'} 
                        alt="logo" 
                        className="w-full h-[18vh] rounded-tr-[40px] rounded-bl-[30px] object-cover" 
                    />
                </div>
            {/* Details */}
            <div className="flex flex-col items-center justify-center space-y-4">               
            {/* body */}
            <div className="grid grid-cols-2 mt-3 ml-[70px] text-md font-semibold">
                {/* Date */}
                <div className="flex items-center justify-center space-x-2 ml-10 ">
                    <HiCalendarDateRange className="text-red-500 w-6 h-6" />
                    <span className="">
                        {societe?.created_at
                            ? `Rejoint ${new Date(societe.created_at)
                                .toLocaleString("fr-FR", { month: "long", year: "numeric" })
                                .replace(/^./, (str) => str.toUpperCase())
                                .replace(/ (\d{4})$/, ", $1")}`
                            : "Date non disponible"}
                    </span>
                </div>
                {/* Location */}
                <div className="flex items-center justify-center space-x-2">
                    <IoLocationSharp className="text-red-500  w-6 h-6" />
                    <p>{societe?.adresse || "Adresse non disponible"}</p>
                </div>
            </div>

            {/* Contact*/}
            <div className="grid grid-cols-1 text-xl  font-normal">
                <div  className="flex gap-2 mt-3 ">
                    <span className="text-red-500 ">Nom:</span>
                    <p>{societe?.nom_contact || "Non disponible"}</p>
                </div>
                <div  className="flex gap-2 mt-3 ">
                    <span className="text-red-500 ">Prenom:</span>
                    <p>{societe?.prenom_contact || "Non disponible"}</p>
                </div>
                <div className="flex space-x-2 mt-3  ">
                    <span className="text-red-500">Email:</span>
                    <p>{societe?.email || "Non disponible"}</p>
                </div>
                <div className="flex space-x-2 mt-3  ">
                    <span className="text-red-500">telephone:</span>
                    <p>{societe?.tel || "Non disponible"}</p>
                </div>
                <div className="flex space-x-2 mt-3  ">
                    <span className="text-red-500">Registre commerce:</span>
                    <p>{societe?.registre_commerce || "Non disponible"}</p>
                </div>
                <div className="flex space-x-2 mt-3  ">
                    <span className="text-red-500">ID fiscal:</span>
                    <p>{societe?.id_fiscal || "Non disponible"}</p>
                </div>
            </div>
            </div>

            </div>                   
        </div>
    );