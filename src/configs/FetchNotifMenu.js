const FetchNotifMenu = async (
    param,
    projetId,
    set_nb_rel_appel,
    set_nb_rdv_appel,
    setnb_rel_visite,
    setnb_rdv_visite,
    set_nb_rel_client_freins
  ) => {
    if (projetId != null) {
      try {
        const { get_nb_relances_rdv_visites, get_nb_menu } = await import('../../src/configs/get_data_menu_horizontal')
        switch (param) {
          case 'D':
            console.log('param D  crm')
            get_nb_relances_rdv_visites(
              'notifications_menu_horizontal_crm',
              set_nb_rel_appel,
              set_nb_rdv_appel,
              setnb_rel_visite,
              setnb_rdv_visite,
              set_nb_rel_client_freins,
              projetId
            )
            break
  
          case 'A':
            console.log('param A  crm')
  
            //1 traitement relances
            get_nb_menu('get_nb_relances_visites', setnb_rel_visite, projetId)
            break
          case 'B':
            console.log('param B  crm')
  
            //2 traitement rdv
            get_nb_menu('get_nb_rdv_visites', setnb_rdv_visite, projetId)
            break
          case 'C':
            console.log('param 3  crm')
  
            //2 traitement rdv
            get_nb_menu('get_nb_frein_client_visite', set_nb_rel_client_freins, projetId)
            break
  
          case 'E':
            console.log('param E  crm')
            get_nb_menu('get_nb_rdv_appels', set_nb_rdv_appel, projetId)
            break
          case 'F':
            console.log('param f  crm')
            get_nb_menu('get_nb_relances_appels', set_nb_rel_appel, projetId)
            break
  
          default:
  
          // code block
        }
      } catch (error) {
        console.error('Error loading functions:', error)
  
        // Handle error loading functions
      }
    }
  }
  
  export default FetchNotifMenu
  