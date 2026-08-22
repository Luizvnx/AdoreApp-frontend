import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, QrCode, CheckCircle2, RefreshCw, Send, 
  FileText, Save, Smartphone, Sparkles, MessageCircle, AlertCircle
} from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { getApiErrorMessage } from '../utils/messageHandler';

export default function WhatsAppAutomation() {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();

  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [savingTemplate, setSavingTemplate] = useState(false);
  const [sendingTest, setSendingTest] = useState(false);

  // Status da Conexão WhatsApp
  const [status, setStatus] = useState<{
    connected: boolean;
    state: string;
    instanceName: string;
    apiUrl?: string;
    qrCodeBase64?: string | null;
    pairCode?: string | null;
    message?: string;
  }>({
    connected: false,
    state: 'close',
    instanceName: 'AvivaIgreja',
  });

  // Template da Mensagem Programada
  const [templateText, setTemplateText] = useState('');

  // Formulário de Teste
  const [testPhone, setTestPhone] = useState('');

  useEffect(() => {
    fetchStatus();
    fetchTemplate();

    // Auto-polling do status a cada 6 segundos para detectar quando o QR Code for lido
    const interval = setInterval(() => {
      fetchStatus(true);
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  const fetchStatus = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const res = await api.get('/whatsapp/status');
      setStatus(res.data);
    } catch (err: any) {
      if (!silent) {
        setStatus({
          connected: false,
          state: 'offline',
          instanceName: 'AvivaIgreja',
          message: 'Não foi possível conectar à Evolution API.',
        });
      }
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const fetchTemplate = async () => {
    try {
      const res = await api.get('/whatsapp/template');
      setTemplateText(res.data.content || '');
    } catch (err) {
      // Silencioso
    }
  };

  const handleGenerateQRCode = async () => {
    try {
      setConnecting(true);
      const res = await api.get('/whatsapp/qrcode');
      if (res.data.qrCodeBase64) {
        setStatus((prev) => ({
          ...prev,
          connected: false,
          state: 'connecting',
          qrCodeBase64: res.data.qrCodeBase64,
        }));
        showSuccess('Novo QR Code gerado! Aponte o celular do WhatsApp da igreja.');
      } else {
        fetchStatus();
      }
    } catch (err: any) {
      showError(getApiErrorMessage(err, 'Erro ao gerar QR Code do WhatsApp.'));
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    if (!window.confirm('Deseja realmente desconectar o WhatsApp da igreja?')) return;

    try {
      setConnecting(true);
      await api.post('/whatsapp/disconnect');
      showSuccess('WhatsApp desconectado.');
      await fetchStatus();
    } catch (err: any) {
      showError('Erro ao desconectar WhatsApp.');
    } finally {
      setConnecting(false);
    }
  };

  const handleSaveTemplate = async () => {
    if (!templateText.trim()) {
      showError('O modelo de mensagem de boas-vindas não pode ficar em branco.');
      return;
    }

    try {
      setSavingTemplate(true);
      await api.put('/whatsapp/template', { content: templateText });
      showSuccess('Modelo de mensagem programada salvo com sucesso!');
    } catch (err: any) {
      showError(getApiErrorMessage(err, 'Erro ao salvar modelo de mensagem.'));
    } finally {
      setSavingTemplate(false);
    }
  };

  const handleSendTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testPhone.trim()) {
      showError('Informe um número de telefone com DDD para teste.');
      return;
    }

    try {
      setSendingTest(true);
      await api.post('/whatsapp/send-test', {
        phone: testPhone.trim(),
        text: templateText
          .replace(/\{\{nome\}\}/g, 'Visitante Exemplo')
          .replace(/\{\{igreja\}\}/g, 'Sede Central')
          .replace(/\{\{acolhedor_nome\}\}/g, 'João (Acolhimento)')
          .replace(/\{\{acolhedor_telefone\}\}/g, '(79) 99999-9999'),
      });
      showSuccess('Mensagem de teste enviada com sucesso no WhatsApp!');
      setTestPhone('');
    } catch (err: any) {
      const serverErr = err.response?.data?.error || err.response?.data?.message;
      showError(serverErr || getApiErrorMessage(err, 'Falha ao enviar mensagem de teste. Verifique se o número possui WhatsApp ativo.'));
    } finally {
      setSendingTest(false);
    }
  };

  const insertVariable = (varName: string) => {
    setTemplateText((prev) => prev + ` {{${varName}}}`);
  };

  // Formata o QR Code caso venha cru sem o prefixo data:image
  const renderQRCodeImage = (base64?: string | null) => {
    if (!base64) return null;
    const src = base64.startsWith('data:') ? base64 : `data:image/png;base64,${base64}`;
    return (
      <div className="bg-white p-4 rounded-2xl shadow-2xl border-4 border-cyan-500/40 inline-block">
        <img src={src} alt="QR Code WhatsApp" className="w-56 h-56 object-contain rounded-lg" />
      </div>
    );
  };

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-slate-950 text-white font-sans pb-20">
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800 px-4 py-3.5 flex items-center gap-4">
        <button
          onClick={() => navigate('/dashboard')}
          className="text-slate-400 hover:text-white p-2 transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-lg font-bold text-white flex items-center gap-2">
            <MessageCircle size={20} className="text-emerald-400" />
            WhatsApp & Automações
          </h1>
          <p className="text-xs text-emerald-400">Integração Evolution API e Boas-Vindas a Visitantes</p>
        </div>
      </header>

      <main className="p-4 sm:p-6 max-w-4xl mx-auto w-full space-y-6">
        
        {/* Card do Status de Conexão com Evolution API / QR Code */}
        <section className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6 backdrop-blur-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
            <div className="flex items-center gap-3.5">
              <div className={`p-3 rounded-2xl border ${status.connected ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-amber-500/10 border-amber-500/30 text-amber-400'}`}>
                <Smartphone size={24} />
              </div>
              <div>
                <span className="text-xs text-slate-400 uppercase font-semibold tracking-wider block">Sessão WhatsApp da Igreja</span>
                <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
                  Instância: {status.instanceName}
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {status.connected ? (
                <span className="inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-3.5 py-1.5 rounded-full text-xs font-bold shadow-sm">
                  <CheckCircle2 size={16} /> CONECTADO
                </span>
              ) : (
                <span className="inline-flex items-center gap-2 bg-amber-500/10 text-amber-400 border border-amber-500/30 px-3.5 py-1.5 rounded-full text-xs font-bold shadow-sm">
                  <AlertCircle size={16} /> DESCONECTADO
                </span>
              )}

              <button
                onClick={() => fetchStatus()}
                className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-all border border-slate-700 cursor-pointer"
                title="Atualizar Status"
              >
                <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              </button>
            </div>
          </div>

          {/* Área Principal de Pareamento / QR Code */}
          {status.connected ? (
            <div className="bg-emerald-950/20 border border-emerald-800/40 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1">
                <h3 className="font-bold text-white text-base flex items-center gap-2">
                  <CheckCircle2 size={20} className="text-emerald-400" />
                  WhatsApp Conectado com Sucesso!
                </h3>
                <p className="text-xs text-slate-300">
                  Todas os novos visitantes cadastrados no aplicativo receberão automaticamente a mensagem de boas-vindas pelo WhatsApp oficial.
                </p>
              </div>

              <button
                onClick={handleDisconnect}
                disabled={connecting}
                className="bg-red-950/80 hover:bg-red-900 border border-red-800 text-red-300 font-semibold px-4 py-2.5 rounded-xl text-xs transition-all cursor-pointer shrink-0"
              >
                Desconectar WhatsApp
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center p-6 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-5">
              {status.state === 'offline' && (
                <div className="w-full bg-amber-950/40 border border-amber-800/60 rounded-2xl p-5 text-left space-y-3 font-sans my-2">
                  <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                    <AlertCircle size={18} />
                    Servidor Evolution API Offline / Não Encontrado
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    A API do sistema tentou se conectar com a Evolution API no endereço <code className="text-cyan-300 font-mono">{status.apiUrl || 'http://localhost:8080'}</code>, mas o serviço não está rodando no momento.
                  </p>
                  <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-xs font-mono space-y-2 text-slate-300">
                    <span className="text-amber-400 font-bold block">Como rodar localmente via Docker (1 comando):</span>
                    <code className="text-cyan-300 select-all block bg-slate-900 p-2.5 rounded-lg border border-slate-800 overflow-x-auto text-[11px]">
                      docker run -d --name evolution-api -p 8080:8080 -e AUTHENTICATION_API_KEY=4296083A4600474181F6959BA361399E atendai/evolution-api:v2.1.1
                    </code>
                    <span className="text-slate-400 text-[11px] block pt-1 font-sans">
                      💡 Se você usa a Evolution API hospedada na nuvem (Railway, Render ou VPS), basta configurar o endereço correto e a API key no arquivo <code>AdoreApp-Api/.env</code>.
                    </span>
                  </div>
                </div>
              )}

              {status.qrCodeBase64 ? (
                <div className="space-y-4">
                  <div className="inline-block relative">
                    {renderQRCodeImage(status.qrCodeBase64)}
                  </div>
                  
                  <div className="max-w-md mx-auto space-y-2">
                    <h3 className="text-sm font-bold text-cyan-400 flex items-center justify-center gap-2">
                      <QrCode size={18} /> Escaneie o QR Code no seu Celular
                    </h3>
                    <ol className="text-xs text-slate-300 space-y-1 text-left bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 font-sans">
                      <li>1. Abra o <strong>WhatsApp</strong> no celular oficial da igreja.</li>
                      <li>2. Toque em <strong>Configurações (ou Menu) &gt; Aparelhos Conectados</strong>.</li>
                      <li>3. Toque em <strong>Conectar um Aparelho</strong> e aponte a câmera para a tela.</li>
                    </ol>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 py-4 max-w-md">
                  <div className="w-14 h-14 bg-amber-500/10 text-amber-400 rounded-2xl border border-amber-500/20 flex items-center justify-center mx-auto">
                    <QrCode size={28} />
                  </div>
                  <h3 className="font-bold text-white text-base">Iniciar Nova Sessão de WhatsApp</h3>
                  <p className="text-xs text-slate-400">
                    Clique no botão abaixo para iniciar a Evolution API e exibir o QR Code de pareamento do número da igreja.
                  </p>
                </div>
              )}

              <button
                onClick={handleGenerateQRCode}
                disabled={connecting}
                className="bg-gradient-to-r from-emerald-500 to-cyan-600 hover:from-emerald-400 hover:to-cyan-500 text-white font-bold px-6 py-3 rounded-xl text-xs transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {connecting ? (
                  <RefreshCw size={16} className="animate-spin" />
                ) : (
                  <QrCode size={16} />
                )}
                {status.qrCodeBase64 ? 'Gerar Novo QR Code' : 'Gerar QR Code para Conexão'}
              </button>
            </div>
          )}
        </section>

        {/* Editor de Mensagem Programada em Arquivo de Texto (welcome_message.txt) */}
        <section className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5 backdrop-blur-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <FileText size={18} className="text-cyan-400" />
                Mensagem Programada de Boas-Vindas
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Definida em arquivo de texto (<code>welcome_message.txt</code>) enviada automaticamente aos visitantes.
              </p>
            </div>

            <button
              onClick={handleSaveTemplate}
              disabled={savingTemplate}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-xs px-5 py-2.5 rounded-xl shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 self-start sm:self-auto"
            >
              <Save size={16} />
              {savingTemplate ? 'Salvando...' : 'Salvar Texto Programado'}
            </button>
          </div>

          {/* Chips de Variáveis Dinâmicas */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-400 block">Clique para inserir variáveis dinâmicas no texto:</span>
            <div className="flex flex-wrap gap-2 text-xs">
              {[
                { name: 'nome', label: 'Nome do Visitante' },
                { name: 'igreja', label: 'Nome da Congregação' },
                { name: 'acolhedor_nome', label: 'Nome do Acolhedor' },
                { name: 'acolhedor_telefone', label: 'Telefone do Acolhedor' },
                { name: 'dias_culto', label: 'Dias de Culto' },
              ].map((item) => (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => insertVariable(item.name)}
                  className="bg-slate-950 border border-slate-800 hover:border-cyan-500/50 text-cyan-300 font-mono text-[11px] px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1"
                >
                  <Sparkles size={12} className="text-cyan-400" />
                  <code>{`{{${item.name}}}`}</code>
                </button>
              ))}
            </div>
          </div>

          {/* Caixas de Texto */}
          <div className="space-y-2">
            <textarea
              rows={9}
              value={templateText}
              onChange={(e) => setTemplateText(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded-2xl p-4 text-sm text-white outline-none transition-all font-mono leading-relaxed shadow-inner"
              placeholder="Digite o texto de boas-vindas..."
            />
          </div>

          {/* Formulário de Envio de Teste */}
          <form onSubmit={handleSendTest} className="pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-center gap-3">
            <div className="w-full sm:flex-1">
              <input
                type="text"
                value={testPhone}
                onChange={(e) => setTestPhone(e.target.value)}
                placeholder="Número de teste com DDD (ex: 79999999999)"
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-xs text-white outline-none transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={sendingTest || !testPhone.trim()}
              className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Send size={14} />
              {sendingTest ? 'Enviando...' : 'Enviar Mensagem de Teste'}
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}
