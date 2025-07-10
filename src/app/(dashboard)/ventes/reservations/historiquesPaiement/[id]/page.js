'use client';
import React, { useState, useEffect } from 'react';
import Table from '@/components/Table';
import { Eye, Download, RefreshCw, FileText, Image, X } from 'lucide-react';
import { useAuth } from '../../../../../../context/AuthContext';
import { APIURL, RESOURCE_URL } from '../../../../../../configs/api';
import format from 'date-fns/format';
import { Avance_Statut, MODE_PAIEMENT } from '../../../../../../configs/enum';
import Link from 'next/link';
import Input from '@/components/Input';
import SelectInput from '@/components/SelectInput';
import { useParams } from 'next/navigation';
import axios from 'axios';
import DateRangePicker from '@/components/DateRangePicker';

const HistoriquesPaiement = () => {
  const color_header_modal = process.env.NEXT_PUBLIC_COLOR_Header_Modal;

  const { user, token } = useAuth();
  const accessToken = token || localStorage.getItem('accessToken');
  const { id } = useParams();
  const [paiements, setPaiements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [totalRows, setTotalRows] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPaiement, setSelectedPaiement] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const [filters, setFilters] = useState({
    cc: '',
    numero_paiement: '',
    date_start: '',
    date_end: '',
    date_reglement: '',
    montant: '',
    mode_paiement: '',
  });
  const [tempFilters, setTempFilters] = useState({ ...filters });

  const entity = {
    API_URL: `getAvanceHistory/${id}`,
    dataKey: 'data',
    searchFields: ['num_recu', 'numero_paiement', 'montant'],
  };

  useEffect(() => {
    fetchData();
  }, [accessToken, currentPage, rowsPerPage, searchTerm, filters]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${APIURL.ROOT}/v1/${entity.API_URL}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        params: {
          page: currentPage,
          size: rowsPerPage,
          ...filters,
        },
      });

      const { data, pagination } = response.data;
      setPaiements(data);
      setTotalRows(pagination.totalItems);
    } catch (error) {
      setError('Error fetching data');
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (paiement) => {
    console.log('lee==>' + JSON.stringify(paiement));
    setSelectedPaiement(paiement);
    setShowModal(true);
    console.log('Modal should open now', paiement); // Add this for debugging
  };

  const getStatutBadge = (statut) => {
    const statutInfo = Avance_Statut[statut];
    return (
      <span
        className={`px-2 py-1 rounded text-sm font-semibold ${
          {
            1: 'bg-green-100 text-green-500',
            3: 'bg-blue-100 text-blue-500',
            2: 'bg-red-100 text-red-500',
          }[statut] || 'bg-gray-100 text-gray-500'
        }`}
      >
        {statutInfo?.label || 'Inconnu'}
      </span>
    );
  };

  const formatData = () => {
    return paiements.map((paiement) => ({
      id: paiement.id,
      num_recu: paiement?.sr == 0 ? paiement?.num_recu : 'SR',
      date_reglement: paiement.date_reglement
        ? format(new Date(paiement.date_reglement), 'dd/MM/yyyy')
        : null,
      cc: `${paiement.user.name} ${paiement.user.prenom}`,
      montant: `${paiement.montant.toLocaleString()} DH`,
      mode_paiement: MODE_PAIEMENT[paiement.mode_paiement]?.label,
      banque: paiement.banque?.nom || null,
      numero_paiement: paiement.numero_paiement,
      echeance: paiement.echeance
        ? format(new Date(paiement.echeance), 'dd/MM/yyyy')
        : null,
      statut: paiement.statut,
      num_remise: paiement?.last_statut?.num_remise,
      date_encaissement: paiement?.last_statut?.date_encaissement,

      actions: (
        <button
          onClick={() => handleViewDetails(paiement)}
          className="text-blue-500 hover:text-blue-700"
          title="View details"
        >
          <Eye className="w-5 h-5" />
        </button>
      ),
      rawData: paiement,
    }));
  };

  const columns = [
    {
      key: 'num_recu',
      label: 'N° Reçu',
    },
    {
      key: 'date_reglement',
      label: 'Date réglement',
    },
    {
      key: 'cc',
      label: 'Responsable',
    },
    {
      key: 'montant',
      label: 'Montant',
    },
    {
      key: 'mode_paiement',
      label: 'Mode paiement',
    },
    {
      key: 'banque',
      label: 'Banque',
    },
    {
      key: 'numero_paiement',
      label: 'Num paiement',
    },
    {
      key: 'echeance',
      label: 'Echéance',
    },
    {
      key: 'statut',
      label: 'Etat',
      render: (row) => getStatutBadge(row.statut),
    },
    {
      key: 'actions',
      label: 'Actions',
    },
  ];

  const data_to_export = () => {
    return paiements.map((paiement) => ({
      'N° Reçu': paiement?.sr == 0 ? paiement?.num_recu : 'SR',
      'Date réglement': paiement.date_reglement
        ? format(new Date(paiement.date_reglement), 'dd/MM/yyyy')
        : null,
      CC: `${paiement.user.name} ${paiement.user.prenom}`,
      Montant: `${paiement.montant.toLocaleString()} DH`,
      'Mode paiement': MODE_PAIEMENT[paiement.mode_paiement]?.label,
      Banque: paiement.banque?.nom || null,
      'Num paiement': paiement.numero_paiement,
      Echéance: paiement.echeance
        ? format(new Date(paiement.echeance), 'dd/MM/yyyy')
        : null,
      Etat: Avance_Statut[paiement.statut]?.label,
      num_remise: paiement?.num_remise,
      date_encaissement: paiement?.date_encaissement,
      commentaireAvance: paiement.commentaire,
      commentaire_rejete: paiement.commentaire_rejete,
    }));
  };

  const columns_export = [
    { key: 'N° Reçu', label: 'N° Reçu' },
    { key: 'Date réglement', label: 'Date réglement' },
    { key: 'CC', label: 'Responsable' },
    { key: 'Montant', label: 'Montant' },
    { key: 'Mode paiement', label: 'Mode paiement' },
    { key: 'Banque', label: 'Banque' },
    { key: 'Num paiement', label: 'Num paiement' },
    { key: 'Echéance', label: 'Echéance' },
    { key: 'Etat', label: 'Etat' },
    { key: 'num_remise', label: 'N° Remise' },
    { key: 'date_encaissement', label: 'Date Encaissement' },
    { key: 'commentaireAvance', label: 'Commentaire' },
    { key: 'commentaire_rejete', label: 'Commentaire Rejeté' },
  ];
  const handleFilterChange = (field, value) => {
    setTempFilters((prev) => ({ ...prev, [field]: value }));
  };

  const applyFilters = () => {
    setFilters(tempFilters);
    setCurrentPage(1);
  };

  const resetFilters = () => {
    const reset = {
      cc: '',
      numero_paiement: '',
      date_start: '',
      date_end: '',
      date_reglement: '',
      montant: '',
      mode_paiement: '',
    };
    setFilters(reset);
    setTempFilters(reset);
    setCurrentPage(1);
  };

  return (
    <div className="relative bg-white shadow-md rounded-lg px-4 py-4">
      <Table
        showSearch={false}
        data_to_export={data_to_export()}
        columns_export={columns_export}
        name_file_export={'historique_paiements_export'}
        columns={columns}
        data={formatData()}
        totalRows={totalRows}
        loading={loading}
        error={error}
        currentPage={currentPage}
        rowsPerPage={rowsPerPage}
        onPageChange={setCurrentPage}
        onRowsPerPageChange={setRowsPerPage}
        onSearchChange={setSearchTerm}
        enableExport={true}
        enableImport={false}
        filterComponent={
          <div className="space-y-4 p-4 rounded-lg">
            <div
              className="grid gap-1"
              style={{
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              }}
            >
              <Input
                type="text"
                label="CC"
                value={tempFilters.cc}
                onChange={(e) => handleFilterChange('cc', e.target.value)}
                className="h-10 px-3 py-2 rounded-md border border-gray-300 w-full text-sm"
              />
              <Input
                type="text"
                label="N° Paiement"
                value={tempFilters.numero_paiement}
                onChange={(e) =>
                  handleFilterChange('numero_paiement', e.target.value)
                }
                className="h-10 px-3 py-2 rounded-md border border-gray-300 w-full text-sm"
              />

              <input
                type={tempFilters.date_end ? 'date' : 'text'}
                placeholder="Date fin"
                value={tempFilters.date_end}
                onFocus={(e) => (e.target.type = 'date')}
                onChange={(e) => handleFilterChange('date_end', e.target.value)}
                className="h-10 px-3 py-2 rounded-md border border-gray-300 w-full text-sm"
              />

              <Input
                type="date"
                label="Date Réglement"
                value={tempFilters.date_reglement}
                onChange={(e) =>
                  handleFilterChange('date_reglement', e.target.value)
                }
                className="h-10 px-3 py-2 rounded-md border border-gray-300 w-full text-sm"
              />

              <Input
                type="number"
                placeholder="Montant"
                value={tempFilters.montant}
                onChange={(e) => handleFilterChange('montant', e.target.value)}
                className="h-10 px-3 py-2 rounded-md border border-gray-300 w-full text-sm"
              />
              <SelectInput
                value={tempFilters.mode_paiement}
                onChange={(value) => handleFilterChange('mode_paiement', value)}
                options={Object.values(MODE_PAIEMENT).map((data) => ({
                  value: data.code,
                  label: data.label,
                }))}
                placeholder="Mode paiement"
                className="h-10 text-sm w-full"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <DateRangePicker
                startName="date_start"
                endName="date_end"
                startValue={tempFilters.date_start}
                endValue={tempFilters.date_end}
                onChange={handleFilterChange}
                placeholder="Choisir une Date"
                label="Date"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={applyFilters}
                className="px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
              >
                Appliquer les filtres
              </button>
              <button
                type="button"
                onClick={resetFilters}
                className="px-3 py-2 bg-gray-400 text-white text-sm rounded hover:bg-gray-500"
              >
                Réinitialiser
              </button>
            </div>
          </div>
        }
      />

      {showModal && selectedPaiement && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full mx-4">
            {/* En-tête coloré */}
            <div
              style={{ backgroundColor: color_header_modal }}
              className="text-white p-4 rounded-t-lg flex justify-between items-center"
            >
              <h3 className="text-lg font-bold">Détails du Paiement</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-white hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-semibold text-black">N° Reçu</p>
                    <p className="text-gray-600">
                      {selectedPaiement?.sr == 0
                        ? selectedPaiement?.num_recu
                        : 'SR'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-black">
                      Date règlement
                    </p>
                    <p className="text-gray-600">
                      {selectedPaiement.date_reglement
                        ? format(
                            new Date(selectedPaiement.date_reglement),
                            'dd/MM/yyyy'
                          )
                        : ''}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-black">
                      Responsable
                    </p>
                    <p className="text-gray-600">
                      {`${selectedPaiement.user.name} ${selectedPaiement.user.prenom}`}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-black">Montant</p>
                    <p className="text-gray-800 font-semibold">
                      {`${selectedPaiement.montant.toLocaleString()} DH`}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-semibold text-black">
                      Mode paiement
                    </p>
                    <p className="text-gray-600">
                      {MODE_PAIEMENT[selectedPaiement.mode_paiement]?.label}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-black">Banque</p>
                    <p className="text-gray-600">
                      {selectedPaiement.banque?.nom || ''}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-black">
                      Numéro paiement
                    </p>
                    <p className="text-gray-600">
                      {selectedPaiement.numero_paiement}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-black">Echéance</p>
                    <p className="text-gray-600">
                      {selectedPaiement.echeance
                        ? format(
                            new Date(selectedPaiement.echeance),
                            'dd/MM/yyyy'
                          )
                        : ''}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <p className="text-sm font-semibold text-black">N° Remise</p>
                  <p className="text-gray-600">
                    {selectedPaiement?.num_remise || ''}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-black">
                    Date Encaissement
                  </p>
                  <p className="text-gray-600">
                    {selectedPaiement.date_encaissement
                      ? format(
                          new Date(selectedPaiement.date_encaissement),
                          'dd/MM/yyyy'
                        )
                      : ''}
                  </p>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <p className="text-sm font-semibold text-black">
                    Commentaire
                  </p>
                  <p className="text-gray-600 bg-gray-50 p-3 rounded">
                    {selectedPaiement.commentaireAvance || ''}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-black">
                    Commentaire Rejeté
                  </p>
                  <p className="text-gray-600 bg-gray-50 p-3 rounded">
                    {selectedPaiement.commenataire_rejete || ''}
                  </p>
                </div>
              </div>

              {selectedPaiement.recu_scanne && (
                <div className="mb-6">
                  <p className="text-sm font-semibold text-black mb-2">
                    Reçu Scanné
                  </p>
                  <div
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-800 cursor-pointer p-2 bg-blue-50 rounded-md w-fit"
                    onClick={() =>
                      window.open(
                        `${RESOURCE_URL.DOCS}/${user?.societe?.raison_sociale_concatene}_${user.societe?.id}/paiements/${selectedPaiement.recu_scanne}`,
                        '_blank'
                      )
                    }
                  >
                    {selectedPaiement.recu_scanne
                      .toLowerCase()
                      .endsWith('.pdf') ? (
                      <FileText className="w-5 h-5 text-red-500" />
                    ) : (
                      <Image className="w-5 h-5 text-blue-500" />
                    )}
                    <span className="font-medium">
                      {selectedPaiement.recu_scanne}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end p-4 border-t">
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                onClick={() => setShowModal(false)}
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HistoriquesPaiement;
