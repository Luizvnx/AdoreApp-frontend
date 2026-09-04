import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Moon, Sun, Monitor, Lock, Shield, Check, Palette, Eye, Sliders } from 'lucide-react';
import { useSettings, type AppTheme, type AccentColor } from '../context/SettingsContext';
import { useToast } from '../context/ToastContext';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ACCENT_COLORS: { id: AccentColor; name: string; class: string; borderClass: string }[] = [
  { id: 'cyan', name: 'Ciano Aviva', class: 'bg-cyan-500', borderClass: 'border-cyan-500' },
  { id: 'blue', name: 'Azul Oceano', class: 'bg-blue-600', borderClass: 'border-blue-500' },
  { id: 'purple', name: 'Roxo Real', class: 'bg-purple-600', borderClass: 'border-purple-500' },
  { id: 'emerald', name: 'Esmeralda', class: 'bg-emerald-500', borderClass: 'border-emerald-500' },
];

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { settings, updateSettings } = useSettings();
  const { showSuccess } = useToast();

  const [tempSettings, setTempSettings] = useState(settings);

  if (!isOpen) return null;

  const handleSave = () => {
    updateSettings(tempSettings);
    showSuccess('Configurações salvas com sucesso!');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header do Modal */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-cyan-500/10 rounded-2xl text-cyan-400 border border-cyan-500/20">
              <Sliders size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Configurações do App</h2>
              <p className="text-xs text-slate-400">Personalize sua experiência</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Seção 1: Tema e Aparência */}
        <section className="space-y-3">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Palette size={14} className="text-cyan-400" /> Tema e Aparência
          </h3>

          {/* Seleção do Modo de Tema */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'dark' as AppTheme, label: 'Escuro', icon: <Moon size={16} /> },
              { id: 'light' as AppTheme, label: 'Claro', icon: <Sun size={16} /> },
              { id: 'system' as AppTheme, label: 'Sistema', icon: <Monitor size={16} /> },
            ].map((item) => {
              const isSelected = tempSettings.theme === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setTempSettings((prev) => ({ ...prev, theme: item.id }))}
                  className={`flex flex-col items-center justify-center gap-2 p-3 rounded-2xl border text-xs font-semibold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-cyan-500/15 border-cyan-500/50 text-cyan-400 shadow-md shadow-cyan-500/10'
                      : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Cor de Destaque */}
          <div className="pt-2">
            <label className="text-[11px] text-slate-400 block mb-2 font-medium">Cor de Destaque</label>
            <div className="flex items-center gap-3">
              {ACCENT_COLORS.map((color) => {
                const isSelected = tempSettings.accentColor === color.id;
                return (
                  <button
                    key={color.id}
                    type="button"
                    onClick={() => setTempSettings((prev) => ({ ...prev, accentColor: color.id }))}
                    className={`w-9 h-9 rounded-full ${color.class} flex items-center justify-center transition-transform cursor-pointer relative ${
                      isSelected ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900 scale-110' : 'hover:scale-105 opacity-80 hover:opacity-100'
                    }`}
                    title={color.name}
                  >
                    {isSelected && <Check size={16} className="text-white drop-shadow" />}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Seção 2: Privacidade e Grupo de Conexão */}
        <section className="space-y-3 pt-2 border-t border-slate-800/80">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Shield size={14} className="text-emerald-400" /> Privacidade no GC e Igreja
          </h3>

          <div className="space-y-3">
            {/* Toggle WhatsApp no GC */}
            <div className="flex items-center justify-between bg-slate-950/60 border border-slate-800/80 p-3.5 rounded-2xl">
              <div className="space-y-0.5 min-w-0 pr-3">
                <span className="text-xs font-semibold text-white block">Exibir WhatsApp no GC</span>
                <span className="text-[11px] text-slate-400 block">Permite que membros do seu GC vejam seu contato.</span>
              </div>
              <button
                type="button"
                onClick={() => setTempSettings((prev) => ({ ...prev, showPhoneInGC: !prev.showPhoneInGC }))}
                className={`w-12 h-6 rounded-full transition-colors relative p-0.5 shrink-0 cursor-pointer ${
                  tempSettings.showPhoneInGC ? 'bg-cyan-500' : 'bg-slate-800'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    tempSettings.showPhoneInGC ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Toggle Data de Aniversário */}
            <div className="flex items-center justify-between bg-slate-950/60 border border-slate-800/80 p-3.5 rounded-2xl">
              <div className="space-y-0.5 min-w-0 pr-3">
                <span className="text-xs font-semibold text-white block">Exibir Aniversário</span>
                <span className="text-[11px] text-slate-400 block">Exibe seu dia de aniversário na lista da igreja.</span>
              </div>
              <button
                type="button"
                onClick={() => setTempSettings((prev) => ({ ...prev, showBirthdayInGC: !prev.showBirthdayInGC }))}
                className={`w-12 h-6 rounded-full transition-colors relative p-0.5 shrink-0 cursor-pointer ${
                  tempSettings.showBirthdayInGC ? 'bg-cyan-500' : 'bg-slate-800'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    tempSettings.showBirthdayInGC ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </section>

        {/* Seção 3: Atalho de Segurança */}
        <section className="pt-2 border-t border-slate-800/80">
          <button
            type="button"
            onClick={() => {
              onClose();
              navigate('/perfil');
            }}
            className="w-full bg-slate-950 border border-slate-800 hover:border-cyan-500/40 p-3.5 rounded-2xl flex items-center justify-between text-left transition-all group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <Lock size={16} className="text-cyan-400" />
              <div>
                <span className="text-xs font-semibold text-white block">Alterar Senha e Dados</span>
                <span className="text-[11px] text-slate-400 block">Acessar perfil para editar credenciais.</span>
              </div>
            </div>
            <Eye size={16} className="text-slate-500 group-hover:text-cyan-400 transition-colors" />
          </button>
        </section>

        {/* Botões do Rodapé */}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-xl font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer text-xs"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex-1 py-3 px-4 rounded-xl font-semibold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 transition-all shadow-lg shadow-cyan-500/20 cursor-pointer text-xs flex items-center justify-center gap-1.5"
          >
            <Check size={16} /> Salvar Preferências
          </button>
        </div>
      </div>
    </div>
  );
};
