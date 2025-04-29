import jsPDF from 'jspdf';
import { format } from 'date-fns';

export const Pre_ReservationPdf = (rows) => {
  const doc = new jsPDF();
  let y = 20;

  rows.forEach((row, index) => {
    const [
      visite_id,
      code,
      rdv,
      date_pre_reserve,
      propriete,
      niveau,
      superficie,
      orientation,
      prix,
      nom,
      prenom,
    ] = row;

    const formattedRdv = rdv
      ? format(new Date(rdv), 'dd/MM/yyyy à HH:mm')
      : 'N/A';

    const title = `Pré-réservation du bien : ${propriete || 'N/A'}`;

    const paragraphText = `
Bien : ${propriete || 'N/A'}
Niveau : ${niveau || 'N/A'}
Superficie : ${superficie || 'N/A'} m²
Orientation : ${orientation || 'N/A'}
Date de rendez-vous : ${formattedRdv}
Prix : ${prix?.toLocaleString() || 'N/A'} DH
Responsable : ${nom || ''} ${prenom || ''}
    `;

    // Title
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    const titleWidth = doc.getTextWidth(title);
    const titleX = (doc.internal.pageSize.width - titleWidth) / 2;
    doc.text(title, titleX, y);

    y += 20;

    // Paragraph
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    const paragraphWidth = 180; // Define width for wrapping
    const lines = doc.splitTextToSize(paragraphText, paragraphWidth);
    const paragraphX = (doc.internal.pageSize.width - paragraphWidth) / 2; // Center the paragraph

    doc.text(lines, paragraphX, y);

    y += lines.length * 7 + 10;

    // Add new page if too long
    if (y > 250 && index < rows.length - 1) {
      doc.addPage();
      y = 20;
    }
  });

  doc.save('pre-reservation.pdf');
};
