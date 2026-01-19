import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Eye, ChevronDown, ChevronRight } from 'lucide-react';
import Table from '@/components/Table';
import {
  type_dst,
  type_dst_dp,
  motif_desistements,
  lien_parentes,
} from '@/configs/enum';
import { fetchData_table_by_id } from '@/configs/api-utils';

export default function HistoriqueDesistementTab({ code_desistement }) {
  const [dossiers, setDossiers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalRows, setTotalRows] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedRows, setExpandedRows] = useState({});

  const entity = {
    id: code_desistement,
    API_URL: 'get_historiques_desistement_by_reservation',
    dataKey: 'data',
    searchFields: [''],
  };

  useEffect(() => {
    fetchData_table_by_id(
      entity,
      {},
      searchTerm,
      currentPage,
      rowsPerPage,
      localStorage.getItem('accessToken'),
      setLoading,
      setError,
      setDossiers,
      setTotalRows
    );
  }, [
    localStorage.getItem('accessToken'),
    currentPage,
    rowsPerPage,
    searchTerm,
  ]);

  // Check if a dossier has desistement details
  const hasDesistementDetails = (row) => {
    return (
      row.histo?.desistement ||
      (row.desisteurs && Object.keys(row.desisteurs).length > 0) ||
      (row.au_profits && Object.keys(row.au_profits).length > 0) ||
      (row.new_aquereur_desistement &&
        Object.keys(row.new_aquereur_desistement).length > 0)
    );
  };

  // Toggle expanded row
  const toggleRowExpanded = (rowId) => {
    setExpandedRows((prev) => ({
      ...prev,
      [rowId]: !prev[rowId],
    }));
  };

  const columns = [
    {
      key: 'expandToggle',
      label: '',
      render: (row, idx) => {
        if (hasDesistementDetails(row)) {
          return (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleRowExpanded(row.id || idx);
              }}
              className="p-1 rounded-full hover:bg-gray-100"
            >
              {expandedRows[row.id || idx] ? (
                <ChevronDown className="w-5 h-5 text-gray-500" />
              ) : (
                <ChevronRight className="w-5 h-5 text-gray-500" />
              )}
            </button>
          );
        }
        return null;
      },
    },
    {
      key: 'date',
      label: 'Date',
      render: (row) =>
        row.histo?.date
          ? format(new Date(row.histo.date), 'dd/MM/yyyy HH:mm')
          : '',
    },
    {
      key: 'cc',
      label: 'Responsable',
      render: (row) => {
        if (row.histo?.reservation_id) {
          return (
            `${row.histo?.reservation?.user?.name || ''} ${
              row.histo?.reservation?.user?.prenom || ''
            }`.trim() || ''
          );
        } else {
          return (
            `${row.histo?.desistement?.user?.name || ''} ${
              row.histo?.desistement?.user?.prenom || ''
            }`.trim() || ''
          );
        }
      },
    },
    {
      key: 'code',
      label: 'Code',
      render: (row) => row.histo?.reservation?.code_reservation || '',
    },
    {
      key: 'acquereurs_ancien',
      label: 'Acquéreurs',
      render: (row) => {
        const createMarkup = (html) => {
          return { __html: html };
        };

        let htmlContent = '';

        if (row.histo?.reservation) {
          const acquereurs =
            row.histo.reservation.aquereurs_ancien?.length > 0
              ? row.histo.reservation.aquereurs_ancien
              : row.histo.reservation.aquereurs || [];

          htmlContent = acquereurs
            .map(
              (acq) =>
                `${acq.client?.nom || ''} ${
                  acq.client?.prenom || ''
                } (<span style="color: rgb(90, 149, 226)">${
                  acq.pourcentage
                }%</span>)`
            )
            .join(', ');
        } else if (
          row.histo?.desistement?.reservation_ancien?.aquereurs_ancien
        ) {
          htmlContent = Object.values(
            row.histo.desistement.reservation_ancien.aquereurs_ancien
          )
            .map(
              (acq) =>
                `${acq.client?.nom || ''} ${
                  acq.client?.prenom || ''
                } (<span style="color: rgb(90, 149, 226)">${
                  acq.pourcentage
                }%</span>)`
            )
            .join(', ');
        }

        return <div dangerouslySetInnerHTML={createMarkup(htmlContent)} />;
      },
    },
    {
      key: 'ancien_bien',
      label: 'Bien',
      render: (row) => {
        if (row.histo?.reservation_id) {
          return row.histo.reservation.bien?.propriete_dite_bien || '';
        } else {
          return row.histo?.desistement?.bien_ancien?.propriete_dite_bien || '';
        }
      },
    },
    {
      key: 'montant_encaisse',
      label: 'Montant Encaissé',
      render: (row) => {
        if (row.histo?.reservation) {
          const montant =
            row.sum_avances || row.histo.reservation?.avances_sum_montant;
          if (montant) return `${montant.toLocaleString()} DH`;
        }
        return '';
      },
    },
    // Dans la section columns, modifiez la colonne actions :
{
  key: 'actions',
  label: 'Actions',
  render: (row) => {
    // Afficher l'icône Eye pour les réservations ET les désistements
    if (row.histo?.reservation_id || row.histo?.desistement_id) {
      // Si c'est une réservation
      if (row.histo?.reservation_id) {
        return (
          <a
            href={`/ventes/reservations/${row.histo.reservation_id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center w-8 h-8 rounded-full !text-blue-500 hover:bg-blue-100 transition-colors duration-200"
            onClick={(e) => e.stopPropagation()}
            title="Voir la réservation"
          >
            <Eye size={16} />
          </a>
        );
      }
      
      // Si c'est un désistement
      if (row.histo?.desistement_id) {
        return (
          <a
            href={`/ventes/desistements/show/${row.histo.desistement_id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center w-8 h-8 rounded-full !text-green-500 hover:bg-green-100 transition-colors duration-200"
            onClick={(e) => e.stopPropagation()}
            title="Voir le désistement"
          >
            <Eye size={16} />
          </a>
        );
      }
    }
    
    return null;
  },
},
  ];

  // Define all possible desistement columns
  const allDesistementColumns = {
    type_desistement: {
      key: 'type_desistement',
      label: 'Type Désistement',
      render: (row) => {
        if (row.histo?.desistement?.type) {
          let typeInfo;
          if (row.histo.desistement.type != 2) {
            typeInfo = type_dst[row.histo.desistement.type];
          } else {
            typeInfo = type_dst_dp[row.histo.desistement.type_dp];
          }

          if (!typeInfo) return '';

          // Assign colors based on type (without modifying the original objects)
          const colorMapping = {
            // type_dst colors
            Définitif: 'bg-red-100 text-red-800', // Error (serious)
            'au Profit': 'bg-amber-100 text-amber-800', // Warning (needs attention)
            'Changement de Bien': 'bg-cyan-100 text-cyan-800', // Info (neutral)

            // type_dst_dp colors
            "au Profit d'un Proche": 'bg-blue-100 text-blue-800', // Primary (family-related)
            "au Profit d'un Co-Reservataire": 'bg-purple-100 text-purple-800', // Secondary (co-reserver)
            Partiel: 'bg-green-100 text-green-800', // Success (partial/less severe)
          };

          const colorClass =
            colorMapping[typeInfo.label] || 'bg-gray-100 text-gray-800';

          return (
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${colorClass}`}
            >
              {typeInfo.label}
            </span>
          );
        }
        return '';
      },
    },

    motif: {
      key: 'motif',
      label: 'Motif',
      render: (row) =>
        row.histo?.desistement
          ? motif_desistements[row.histo.desistement.motif]?.label
          : '',
    },
    lien_parente: {
      key: 'lien_parente',
      label: 'Lien de Parenté',
      render: (row) =>
        row.histo?.desistement
          ? lien_parentes[row.histo.desistement.lien_parente]?.label
          : '',
    },
    ancien_acquereurs: {
      key: 'ancien_acquereurs',
      label: 'Anciens Acquéreurs',
      render: (row) => {
        if (row.histo?.reservation) {
          const acquereurs =
            row.histo.reservation.aquereurs_ancien?.length > 0
              ? row.histo.reservation.aquereurs_ancien
              : row.histo.reservation.aquereurs || [];

          return acquereurs.map((acq, idx) => (
            <div key={idx} className="mb-1">
              <span className="font-medium">
                {acq.client?.nom || ''} {acq.client?.prenom || ''}
              </span>
              <span className="text-gray-500 ml-2">({acq.pourcentage}%)</span>
            </div>
          ));
        } else if (
          row.histo?.desistement?.reservation_ancien?.aquereurs_ancien
        ) {
          return Object.values(
            row.histo.desistement.reservation_ancien.aquereurs_ancien
          ).map((acq, idx) => (
            <div key={idx} className="mb-1">
              <span className="font-medium">
                {acq.client?.nom || ''} {acq.client?.prenom || ''}
              </span>
              <span className="text-gray-500 ml-2">({acq.pourcentage}%)</span>
            </div>
          ));
        }
        return '';
      },
    },
    desisteurs: {
      key: 'desisteurs',
      label: 'Désisteurs',
      render: (row) => {
        if (row.desisteurs && Object.keys(row.desisteurs).length > 0) {
          return (
            <div>
              {Object.values(row.desisteurs).map((desisteur, idx) => (
                <div key={idx} className="mb-1">
                  <span className="font-medium">
                    {desisteur.client_nom || ''} {desisteur.client_prenom || ''}
                  </span>
                  <span className="text-red-500 ml-2">
                    ({desisteur.client_percent}%)
                  </span>
                </div>
              ))}
            </div>
          );
        }
        return '';
      },
    },
    au_profit: {
      key: 'au_profit',
      label: 'Au Profit',
      render: (row) => {
        if (row.au_profits && Object.keys(row.au_profits).length > 0) {
          return (
            <div>
              {Object.values(row.au_profits).map((profit, idx) => (
                <div key={idx} className="mb-1">
                  <span className="font-medium">
                    {profit.client_nom || ''} {profit.client_prenom || ''}
                  </span>
                  <span className="text-green-500 ml-2">
                    ({profit.client_percent}%)
                  </span>
                </div>
              ))}
            </div>
          );
        }
        return '';
      },
    },
    nouveau_acquereurs: {
      key: 'nouveau_acquereurs',
      label: 'Nouveaux Acquéreurs',
      render: (row) => {
        if (
          row.new_aquereur_desistement &&
          Object.keys(row.new_aquereur_desistement).length > 0
        ) {
          return (
            <div>
              {Object.values(row.new_aquereur_desistement).map((acq, idx) => (
                <div key={idx} className="mb-1">
                  <span className="font-medium">
                    {acq.nv_client_nom || ''} {acq.nv_client_prenom || ''}
                  </span>
                  <span className="text-green-500 ml-2">
                    ({acq.nv_client_percent}%)
                  </span>
                </div>
              ))}
            </div>
          );
        }
        return '';
      },
    },
    ancien_bien: {
      key: 'ancien_bien',
      label: 'Ancien Bien',
      render: (row) => {
        if (row.histo?.reservation_id) {
          return row.histo.reservation.bien?.propriete_dite_bien || '';
        } else {
          return row.histo?.desistement?.bien_ancien?.propriete_dite_bien || '';
        }
      },
    },
    nouveau_bien: {
      key: 'nouveau_bien',
      label: 'Nouveau Bien',
      render: (row) => row.bien_new_propriete || '',
    },
    montant_ajouter: {
      key: 'montant_ajouter',
      label: 'Montant à ajouter',
      render: (row) => {
        if (row.histo?.desistement?.montant_a_ajouter) {
          return `${row.histo.desistement.montant_a_ajouter.toLocaleString()} DH`;
        }
        return '';
      },
    },
    penalite: {
      key: 'penalite',
      label: 'Pénalité',
      render: (row) => {
        if (row.penalite_montant) {
          return `${row.penalite_montant.toLocaleString()} DH`;
        }
        return '';
      },
    },
  };

  // Function to get desistement columns based on type
  const getDesistementColumns = (row) => {
    const desistementType = row.histo?.desistement?.type;
    const desistementTypeDp = row.histo?.desistement?.type_dp;
    console.log('le tye dp =+>' + desistementTypeDp);
    // Always show type column first
    let columns = [allDesistementColumns.type_desistement];

    // Convert to numbers for comparison (API might return strings)
    const typeNum = parseInt(desistementType);
    const typeDpNum = parseInt(desistementTypeDp);

    // Determine which additional columns to show based on type
    if (typeNum == 1) {
      // Désistement Définitif => motif / pénalité
      columns.push(allDesistementColumns.motif, allDesistementColumns.penalite);
    } else if (typeNum == 2) {
      // Based on type_dp for "Profit un proche" variations
      if (typeDpNum == 1) {
        // Profit un proche => lien de parenté / anciens acquéreurs / désisteurs / nouveaux acquéreurs / pénalité
        columns.push(
          allDesistementColumns.lien_parente,
          allDesistementColumns.ancien_acquereurs,
          allDesistementColumns.desisteurs,
          allDesistementColumns.nouveau_acquereurs,
          allDesistementColumns.penalite
        );
      } else if (typeDpNum == 3) {
        // Désistement Partiel => lien de parenté / anciens acquéreurs / nouveaux acquéreurs / pénalité
        console.log('ana hnaa');
        columns.push(
          allDesistementColumns.lien_parente,
          allDesistementColumns.ancien_acquereurs,
          allDesistementColumns.nouveau_acquereurs,
          allDesistementColumns.penalite
        );
      } else if (typeDpNum == 2) {
        // Désistement co Réservataire => anciens acquéreurs / désisteurs / au profit / pénalité
        columns.push(
          allDesistementColumns.ancien_acquereurs,
          allDesistementColumns.desisteurs,
          allDesistementColumns.au_profit,
          allDesistementColumns.penalite
        );
      }
    } else if (typeNum == 3) {
      // Changement de Bien => ancien bien / nouveau bien / montant à ajouter / pénalité
      columns.push(
        allDesistementColumns.ancien_bien,
        allDesistementColumns.nouveau_bien,
        allDesistementColumns.montant_ajouter,
        allDesistementColumns.penalite
      );
    }

    return columns;
  };

  // Simple export with all data in one row
  // Direct data access export with matching column keys
  const exportData = () => {
    return dossiers.map((dossier, index) => {
      const row = {};

      // Column 1: N°
      row['N°'] = index + 1;

      // Column 2: Date
      row['Date'] = dossier.histo?.date
        ? format(new Date(dossier.histo.date), 'dd/MM/yyyy HH:mm')
        : '';

      // Column 3: Responsable
      if (dossier.histo?.reservation_id) {
        row['Responsable'] = `${dossier.histo?.reservation?.user?.name || ''} ${
          dossier.histo?.reservation?.user?.prenom || ''
        }`.trim();
      } else {
        row['Responsable'] = `${dossier.histo?.desistement?.user?.name || ''} ${
          dossier.histo?.desistement?.user?.prenom || ''
        }`.trim();
      }

      // Column 4: Code
      row['Code'] = dossier.histo?.reservation?.code_reservation || '';

      // Column 5: Acquéreurs (FIXED - use the same logic as in the table)
      let acquereursText = '';
      if (dossier.histo?.reservation) {
        const acquereurs =
          dossier.histo.reservation.aquereurs_ancien?.length > 0
            ? dossier.histo.reservation.aquereurs_ancien
            : dossier.histo.reservation.aquereurs || [];

        acquereursText = acquereurs
          .map(
            (acq) =>
              `${acq.client?.nom || ''} ${acq.client?.prenom || ''} (${
                acq.pourcentage
              }%)`
          )
          .filter((text) => text.trim() !== '()')
          .join(', ');
      } else if (
        dossier.histo?.desistement?.reservation_ancien?.aquereurs_ancien
      ) {
        acquereursText = Object.values(
          dossier.histo.desistement.reservation_ancien.aquereurs_ancien
        )
          .map(
            (acq) =>
              `${acq.client?.nom || ''} ${acq.client?.prenom || ''} (${
                acq.pourcentage
              }%)`
          )
          .filter((text) => text.trim() !== '()')
          .join(', ');
      }
      row['Acquéreurs'] = acquereursText;

      // Column 6: Bien
      if (dossier.histo?.reservation_id) {
        row['Bien'] = dossier.histo.reservation.bien?.propriete_dite_bien || '';
      } else {
        row['Bien'] =
          dossier.histo?.desistement?.bien_ancien?.propriete_dite_bien || '';
      }

      // Column 7: Montant Encaissé
      if (dossier.histo?.reservation) {
        const montant =
          dossier.sum_avances || dossier.histo.reservation?.avances_sum_montant;
        row['Montant Encaissé'] = montant
          ? `${montant.toLocaleString()} DH`
          : '';
      } else {
        row['Montant Encaissé'] = '';
      }

      // Column 8: Type Désistement
      if (dossier.histo?.desistement?.type) {
        let typeInfo;
        if (dossier.histo.desistement.type != 2) {
          typeInfo = type_dst[dossier.histo.desistement.type];
        } else {
          typeInfo = type_dst_dp[dossier.histo.desistement.type_dp];
        }
        row['Type Désistement'] = typeInfo?.label || '';
      } else {
        row['Type Désistement'] = '';
      }

      // Column 9: Motif
      if (dossier.histo?.desistement?.motif) {
        row['Motif'] =
          motif_desistements[dossier.histo.desistement.motif]?.label || '';
      } else {
        row['Motif'] = '';
      }

      // Column 10: Lien de Parenté
      if (dossier.histo?.desistement?.lien_parente) {
        row['Lien de Parenté'] =
          lien_parentes[dossier.histo.desistement.lien_parente]?.label || '';
      } else {
        row['Lien de Parenté'] = '';
      }

      // Column 11: Désisteurs
      if (dossier.desisteurs && Object.keys(dossier.desisteurs).length > 0) {
        row['Désisteurs'] = Object.values(dossier.desisteurs)
          .map(
            (desisteur) =>
              `${desisteur.client_nom || ''} ${
                desisteur.client_prenom || ''
              } (${desisteur.client_percent}%)`
          )
          .filter((text) => text.trim() !== '()')
          .join(', ');
      } else {
        row['Désisteurs'] = '';
      }

      // Column 12: Au Profit
      if (dossier.au_profits && Object.keys(dossier.au_profits).length > 0) {
        row['Au Profit'] = Object.values(dossier.au_profits)
          .map(
            (profit) =>
              `${profit.client_nom || ''} ${profit.client_prenom || ''} (${
                profit.client_percent
              }%)`
          )
          .filter((text) => text.trim() !== '()')
          .join(', ');
      } else {
        row['Au Profit'] = '';
      }

      // Column 13: Nouveau Acquéreurs
      if (
        dossier.new_aquereur_desistement &&
        Object.keys(dossier.new_aquereur_desistement).length > 0
      ) {
        row['Nouveau Acquéreurs'] = Object.values(
          dossier.new_aquereur_desistement
        )
          .map(
            (acq) =>
              `${acq.nv_client_nom || ''} ${acq.nv_client_prenom || ''} (${
                acq.nv_client_percent
              }%)`
          )
          .filter((text) => text.trim() !== '()')
          .join(', ');
      } else {
        row['Nouveau Acquéreurs'] = '';
      }

      // Column 14: Ancien Bien
      if (dossier.histo?.reservation_id) {
        row['Ancien Bien'] =
          dossier.histo.reservation.bien?.propriete_dite_bien || '';
      } else {
        row['Ancien Bien'] =
          dossier.histo?.desistement?.bien_ancien?.propriete_dite_bien || '';
      }

      // Column 15: Nouveau Bien
      row['Nouveau Bien'] = dossier.bien_new_propriete || '';

      // Column 16: Montant à ajouter
      if (dossier.histo?.desistement?.montant_a_ajouter) {
        row[
          'Montant à ajouter'
        ] = `${dossier.histo.desistement.montant_a_ajouter.toLocaleString()} DH`;
      } else {
        row['Montant à ajouter'] = '';
      }

      // Column 17: Pénalité
      if (dossier.penalite_montant) {
        row['Pénalité'] = `${dossier.penalite_montant.toLocaleString()} DH`;
      } else {
        row['Pénalité'] = '';
      }

      // Debug log to check the data
      console.log('Export row data:', row);

      return row;
    });
  };

  // Updated export columns - ensure exact match with row keys
  const columnsExport = [
    { key: 'N°', label: 'N°' },
    { key: 'Date', label: 'Date' },
    { key: 'Responsable', label: 'Responsable' },
    { key: 'Code', label: 'Code' },
    { key: 'Acquéreurs', label: 'Acquéreurs' },
    { key: 'Bien', label: 'Bien' },
    { key: 'Montant Encaissé', label: 'Montant Encaissé' },
    { key: 'Type Désistement', label: 'Type Désistement' },
    { key: 'Motif', label: 'Motif' },
    { key: 'Lien de Parenté', label: 'Lien de Parenté' },
    { key: 'Désisteurs', label: 'Désisteurs' },
    { key: 'Au Profit', label: 'Au Profit' },
    { key: 'Nouveau Acquéreurs', label: 'Nouveau Acquéreurs' },
    { key: 'Ancien Bien', label: 'Ancien Bien' },
    { key: 'Nouveau Bien', label: 'Nouveau Bien' },
    { key: 'Montant à ajouter', label: 'Montant à ajouter' },
    { key: 'Pénalité', label: 'Pénalité' },
  ];

  // Render the expanded row with dynamic columns based on desistement type
  const renderExpandedRow = (row, idx) => {
    const rowId = row.id || idx;

    if (!expandedRows[rowId] || !hasDesistementDetails(row)) {
      return null;
    }

    // Get dynamic columns based on desistement type
    const dynamicColumns = getDesistementColumns(row);

    return (
      <div className="p-0 bg-gray-50">
        <div className="overflow-hidden transition-all duration-300 ease-in-out">
          <div className="p-4">
            <h6 className="text-md font-semibold mb-3 !text-gray-700 flex items-center">
              <span className="w-1.5 h-5 bg-blue-600 rounded-sm mr-2"></span>
              Détails du désistement
            </h6>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse table-fixed">
                <thead className="bg-blue-50">
                  <tr>
                    {dynamicColumns.map((col, index) => (
                      <th
                        key={col.key}
                        className="text-center px-3 py-2 border-b border-gray-200 font-medium !text-gray-700 min-w-0"
                        style={{
                          width: `${100 / dynamicColumns.length}%`,
                        }}
                      >
                        <div className="truncate" title={col.label}>
                          {col.label}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="bg-white">
                    {dynamicColumns.map((col) => (
                      <td
                        key={col.key}
                        className="text-center px-3 py-2 border-b border-gray-200 min-w-0 align-top"
                        style={{
                          width: `${100 / dynamicColumns.length}%`,
                          wordWrap: 'break-word',
                          maxWidth: '0',
                        }}
                      >
                        <div className="w-full">
                          {col.render ? col.render(row) : ''}
                        </div>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-md !text-red-700">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-sm rounded-lg">
      <div className="bg-white shadow-sm rounded-lg">
        <div className="p-6">
          <Table
            title="Historique Désistement"
            data={dossiers}
            columns={columns}
            totalRows={totalRows}
            loading={loading}
            emptyMessage="Aucun dossier trouvé pour ce bien."
            onPageChange={setCurrentPage}
            onRowsPerPageChange={setRowsPerPage}
            onSearchChange={setSearchTerm}
            currentPage={currentPage}
            rowsPerPage={rowsPerPage}
            enableExport={dossiers.length > 0}
            name_file_export="historiques_desistement"
            data_to_export={exportData()}
            columns_export={columnsExport}
            renderExpandedRow={renderExpandedRow}
            onRowClick={(row, idx) => {
              if (hasDesistementDetails(row)) {
                toggleRowExpanded(row.id || idx);
              }
            }}
            showSearch={false}
            rowClassName={(row) =>
              hasDesistementDetails(row) ? 'cursor-pointer' : ''
            }
            expandedRows={expandedRows}
            customTableStyle={true}
          />
        </div>
      </div>
    </div>
  );
}
