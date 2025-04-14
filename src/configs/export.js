import * as XLSX from 'xlsx'
import toast from 'react-hot-toast'

export const handleExportExcel = (data, columns, fileName = 'export_data.xlsx') => {
  if (data && data.length > 0) {
    // Transform data using columns (if provided)
    const formattedData = columns
      ? data.map(item => {
          const formattedItem = {}
          columns.forEach(({ key, label }) => {
            formattedItem[label] = item[key]
          })
          
          return formattedItem
        })
      : data

    const worksheet = XLSX.utils.json_to_sheet(formattedData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Données')
    XLSX.writeFile(workbook, fileName)
  } else {
    toast.error('Aucune donnée à exporter.')
  }
}
