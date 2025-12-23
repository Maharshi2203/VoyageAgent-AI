import React, { useState } from 'react';
import { Download, FileText, Loader2 } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface ExportButtonProps {
    elementId: string;
    filename: string;
}

export const ExportButton: React.FC<ExportButtonProps> = ({ elementId, filename }) => {
    const [isExporting, setIsExporting] = useState(false);

    const handleExport = async () => {
        const element = document.getElementById(elementId);
        if (!element) return;

        setIsExporting(true);
        try {
            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff'
            });
            
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const imgProps = pdf.getImageProperties(imgData);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
            
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`${filename}.pdf`);
        } catch (error) {
            console.error('Export failed:', error);
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <button
            onClick={handleExport}
            disabled={isExporting}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-primary text-space-main font-bold shadow-lg hover:bg-brand-glow transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
            {isExporting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
                <FileText className="w-5 h-5" />
            )}
            <span>{isExporting ? 'Generating PDF...' : 'Download Itinerary'}</span>
        </button>
    );
};
