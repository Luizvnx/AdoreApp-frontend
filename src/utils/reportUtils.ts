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
  paymentMethod?: string;
}

const getPaymentMethodLabel = (method?: string) => {
  switch (method) {
    case 'PIX': return 'Pix';
    case 'DINHEIRO': return 'Dinheiro';
    case 'DEBITO': return 'Débito';
    case 'CREDITO': return 'Crédito';
    case 'TRANSFERENCIA': return 'Transferência';
    default: return method || 'Pix';
  }
};

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
};

export const exportFinanceToPDF = (transactions: Transaction[], periodLabel: string) => {
  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text(`Relatório Financeiro - ${periodLabel}`, 14, 18);

  // Calcula os totais
  const totalIncome = transactions.filter(t => t.type === 'INCOME').reduce((acc, t) => acc + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'EXPENSE').reduce((acc, t) => acc + t.amount, 0);
  const netTotal = totalIncome - totalExpense;

  const tableData = transactions.map(t => [
    new Date(t.date).toLocaleDateString('pt-BR'),
    t.title,
    t.category.replace('_', ' '),
    getPaymentMethodLabel(t.paymentMethod),
    t.type === 'INCOME' ? 'Entrada' : 'Saída',
    formatCurrency(t.amount)
  ]);

  // Linhas de Totais no Fim do Relatório
  const summaryRows = [
    ['', '', '', '', 'Total de Entradas:', formatCurrency(totalIncome)],
    ['', '', '', '', 'Total de Saídas:', formatCurrency(totalExpense)],
    ['', '', '', '', 'Total Consolidado:', formatCurrency(netTotal)]
  ];

  autoTable(doc, {
    startY: 25,
    head: [['Data', 'Descrição', 'Categoria', 'Forma Pagto', 'Tipo', 'Valor']],
    body: tableData,
    foot: summaryRows,
    footStyles: {
      fillColor: [240, 240, 240],
      textColor: [0, 0, 0],
      fontStyle: 'bold'
    }
  });

  const sanitizedLabel = periodLabel.replace(/[/\\?%*:|"<>]/g, '_') || 'geral';
  doc.save(`Relatorio_Financeiro_${sanitizedLabel}.pdf`);
};

export const exportFinanceToExcel = (transactions: Transaction[], periodLabel: string) => {
  // Calcula os totais
  const totalIncome = transactions.filter(t => t.type === 'INCOME').reduce((acc, t) => acc + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'EXPENSE').reduce((acc, t) => acc + t.amount, 0);
  const netTotal = totalIncome - totalExpense;

  const worksheetData: any[] = transactions.map(t => ({
    Data: new Date(t.date).toLocaleDateString('pt-BR'),
    Descrição: t.title,
    Categoria: t.category.replace('_', ' '),
    'Forma de Pagamento': getPaymentMethodLabel(t.paymentMethod),
    Tipo: t.type === 'INCOME' ? 'Entrada' : 'Saída',
    'Valor (R$)': t.amount
  }));

  // Adiciona linha em branco e totais ao fim do relatório Excel
  worksheetData.push({});
  worksheetData.push({
    Data: 'RESUMO DOS TOTAIS',
    Descrição: '',
    Categoria: '',
    'Forma de Pagamento': '',
    Tipo: 'Total Entradas',
    'Valor (R$)': totalIncome
  });
  worksheetData.push({
    Data: '',
    Descrição: '',
    Categoria: '',
    'Forma de Pagamento': '',
    Tipo: 'Total Saídas',
    'Valor (R$)': totalExpense
  });
  worksheetData.push({
    Data: '',
    Descrição: '',
    Categoria: '',
    'Forma de Pagamento': '',
    Tipo: 'TOTAL CONSOLIDADO',
    'Valor (R$)': netTotal
  });

  const worksheet = XLSX.utils.json_to_sheet(worksheetData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Transações');

  const sanitizedLabel = periodLabel.replace(/[/\\?%*:|"<>]/g, '_') || 'geral';
  XLSX.writeFile(workbook, `Relatorio_Financeiro_${sanitizedLabel}.xlsx`);
};
