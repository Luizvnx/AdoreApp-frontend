import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

interface Transaction {
  id: string;
  title: string;
  type: 'INCOME' | 'EXPENSE';
  amount: number;
  date: string;
  category: string;
}

export const exportFinanceToPDF = (transactions: Transaction[], periodLabel: string) => {
  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text(`Relatório Financeiro - ${periodLabel}`, 14, 20);

  const tableData = transactions.map(t => [
    new Date(t.date).toLocaleDateString('pt-BR'),
    t.title,
    t.category.replace('_', ' '),
    t.type === 'INCOME' ? 'Entrada' : 'Saída',
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(t.amount)
  ]);

  autoTable(doc, {
    startY: 30,
    head: [['Data', 'Descrição', 'Categoria', 'Tipo', 'Valor']],
    body: tableData,
  });

  doc.save(`Relatorio_Financeiro_${periodLabel.replace('/', '_') || 'geral'}.pdf`);
};

export const exportFinanceToExcel = (transactions: Transaction[], periodLabel: string) => {
  const worksheetData = transactions.map(t => ({
    Data: new Date(t.date).toLocaleDateString('pt-BR'),
    Descrição: t.title,
    Categoria: t.category.replace('_', ' '),
    Tipo: t.type === 'INCOME' ? 'Entrada' : 'Saída',
    'Valor (R$)': t.amount
  }));

  const worksheet = XLSX.utils.json_to_sheet(worksheetData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Transações');

  XLSX.writeFile(workbook, `Relatorio_Financeiro_${periodLabel.replace('/', '_') || 'geral'}.xlsx`);
};
