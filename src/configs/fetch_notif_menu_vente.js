const FetchNotifMenuVente = async (
  param,
  projetId,
  userRole,
  set_nb_demande_pre_remb,
  set_nb_dst_att_valide,
  set_nb_pen_att_valide,
  set_nb_att_valid_reservation,
  set_nb_att_valid_avances,
  set_nb_echeances

  //set_nb_rdv_notaire
) => {
  if (projetId != null) {
    try {
      const { get_nb_notif_horizontal, get_notifs_horizontal_admin, get_notifs_horizontal_comm } = await import('../../src/configs/get_data_menu_vene_horizontal')

      const route =
        userRole == 3 ? 'notifications_menu_horizontal_vente_commercial' : 'notifications_menu_horizontal_vente_admin'
      switch (param) {
        case 0:
          //load page ==> all routes
          if (userRole == 3) {
            console.log('param 0 comm' + userRole)

            get_notifs_horizontal_comm(
              route,
              set_nb_dst_att_valide,
              set_nb_pen_att_valide,
              set_nb_att_valid_avances,
              set_nb_att_valid_reservation,
              set_nb_demande_pre_remb,
              set_nb_echeances,

              //,set_nb_rdv_notaire
              projetId
            )
            break
          } else {
            console.log('param 0 admin' + userRole)

            get_notifs_horizontal_admin(
              route,
              set_nb_dst_att_valide,
              set_nb_pen_att_valide,
              set_nb_att_valid_avances,
              set_nb_att_valid_reservation,
              set_nb_demande_pre_remb,
              set_nb_echeances,

              //set_nb_rdv_notaire,
              projetId
            )
            break
          }

        case 1:
          console.log('param 1 ' + userRole)

          //1 traitement reservation
          get_nb_notif_horizontal('get_notif_reservation_att_validation', set_nb_att_valid_reservation, projetId)
          break
        case 2:
          console.log('param 2  ' + userRole)

          //2 traitement avance
          get_nb_notif_horizontal(`get_notif_avances_att_validation`, set_nb_att_valid_avances, projetId)
          break
        case 3:
          console.log('param 3  ' + userRole)

          //3 traitement  penalite
          get_nb_notif_horizontal('get_notif_penalite_admin', set_nb_pen_att_valide, projetId)
          break
        case 4:
          console.log('param 4  ' + userRole)

          //4 traitement  remboursement
          get_nb_notif_horizontal('get_notif_demande_pre_remboursement', set_nb_demande_pre_remb, projetId)
          break
        case 5:
          console.log('param 5  ' + userRole)

          //4 RELANCES ECHEANCE
          get_nb_notif_horizontal('get_echeances_menu', set_nb_echeances, projetId)
          break
        case 6:
          console.log('param 6  ' + userRole)

          //3 traitement  penalite
          get_nb_notif_horizontal('get_notif_dst_att_validation_menu', set_nb_dst_att_valide, projetId)
          break
        

        /*case 6:
          console.log('param 6 ' + userRole)

          //6 rdv notaire a validé
          get_nb_notif_horizontal('get_rdv_notaire_menu', set_nb_rdv_notaire, projetId)
          break*/
        default:

        // code block
      }
    } catch (error) {
      console.error('Error loading functions:', error)

      // Handle error loading functions
    }
  }
}

export default FetchNotifMenuVente
