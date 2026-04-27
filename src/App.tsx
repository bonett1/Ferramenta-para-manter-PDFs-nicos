/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { 
  FileUp, 
  Files, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  FilePlus, 
  RefreshCcw,
  FileMinus,
  FileText,
  ChevronRight,
  Download,
  Loader2
} from 'lucide-react';

interface FileInfo {
  id: string;
  name: string;
  size: number;
  file: File;
}

type Step = 'initial' | 'updated' | 'results';

export default function App() {
  const [step, setStep] = useState<Step>('initial');
  const [initialFiles, setInitialFiles] = useState<FileInfo[]>([]);
  const [updatedFiles, setUpdatedFiles] = useState<FileInfo[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const processFiles = async (files: FileList | null, type: 'initial' | 'updated') => {
    if (!files) return;
    setIsProcessing(true);
    
    // Pequeno delay para simular processamento e permitir animação de loading
    await new Promise(resolve => setTimeout(resolve, 500));

    const newFileInfos: FileInfo[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type !== 'application/pdf') continue;
      
      newFileInfos.push({
        id: `${file.name}-${file.size}-${Date.now()}-${Math.random()}`,
        name: file.name,
        size: file.size,
        file
      });
    }

    if (type === 'initial') {
      setInitialFiles(prev => [...prev, ...newFileInfos]);
    } else {
      setUpdatedFiles(prev => [...prev, ...newFileInfos]);
    }
    setIsProcessing(false);
  };

  const removeFile = (index: number, type: 'initial' | 'updated') => {
    if (type === 'initial') {
      setInitialFiles(prev => prev.filter((_, i) => i !== index));
    } else {
      setUpdatedFiles(prev => prev.filter((_, i) => i !== index));
    }
  };

  const getNewFiles = () => {
    const initialNames = new Set(initialFiles.map(f => f.name));
    return updatedFiles.filter(f => !initialNames.has(f.name));
  };

  const resetAll = () => {
    setInitialFiles([]);
    setUpdatedFiles([]);
    setStep('initial');
    setIsDownloading(false);
  };

  const handleDownload = async () => {
    if (newFiles.length === 0) return;
    
    setIsDownloading(true);
    try {
      const zip = new JSZip();
      
      newFiles.forEach((fileInfo) => {
        zip.file(fileInfo.name, fileInfo.file);
      });
      
      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, `pdfs_unicos_${new Date().getTime()}.zip`);
    } catch (error) {
      console.error('Erro ao gerar ZIP:', error);
      alert('Ocorreu um erro ao gerar o arquivo ZIP. Tente novamente.');
    } finally {
      setIsDownloading(false);
    }
  };

  const newFiles = getNewFiles();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-blue-600 p-2.5 rounded-xl text-white shadow-lg shadow-blue-200">
                <Files size={24} />
              </div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">PDF Delta Analyzer</h1>
            </div>
            <p className="text-slate-500 font-medium ml-1">Comparação baseada em nomes de arquivos</p>
          </div>
          <div className="flex gap-3">
            <div className="hidden sm:flex px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 shadow-sm items-center">
              Critério: <span className="text-blue-600 ml-1.5 uppercase text-xs tracking-wider">Nome do Arquivo</span>
            </div>
            {(step === 'results' || initialFiles.length > 0) && (
              <button 
                onClick={resetAll}
                className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-semibold shadow-md transition-transform hover:scale-105 active:scale-95 flex items-center gap-2"
              >
                <RefreshCcw size={14} /> Reiniciar
              </button>
            )}
          </div>
        </header>

        {/* Stepper / Progress */}
        <div className="flex items-center gap-4 mb-10 overflow-x-auto pb-4 scrollbar-thin">
          <StepIndicator 
            active={step === 'initial'} 
            done={initialFiles.length > 0 && step !== 'initial'}
            number={1} 
            label="Base (Antigo)" 
            onClick={() => setStep('initial')}
          />
          <ChevronRight size={16} className="text-slate-300 shrink-0" />
          <StepIndicator 
            active={step === 'updated'} 
            done={updatedFiles.length > 0 && step === 'results'}
            number={2} 
            label="Atualizado (Novo)" 
            onClick={() => initialFiles.length > 0 ? setStep('updated') : null}
            disabled={initialFiles.length === 0}
          />
          <ChevronRight size={16} className="text-slate-300 shrink-0" />
          <StepIndicator 
            active={step === 'results'} 
            done={false}
            number={3} 
            label="Resultado Final" 
            onClick={() => updatedFiles.length > 0 ? setStep('results') : null}
            disabled={updatedFiles.length === 0}
          />
        </div>

        <main className="grid grid-cols-12 gap-6 min-h-[500px]">
          <AnimatePresence mode="wait">
            {step === 'initial' && (
              <motion.div
                key="initial"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="col-span-12 lg:col-span-8 bg-white rounded-[2rem] border border-slate-200 p-8 shadow-sm flex flex-col"
              >
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-600 font-black italic text-lg">01</div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-800">Primeiro Envio</h2>
                    <p className="text-slate-500 text-sm">Base de comparação para detectar duplicatas.</p>
                  </div>
                </div>

                <Dropzone 
                  onFiles={(f) => processFiles(f, 'initial')} 
                  isProcessing={isProcessing}
                  count={initialFiles.length}
                />

                <FileListDisplay 
                  files={initialFiles} 
                  onRemove={(i) => removeFile(i, 'initial')} 
                  title="Arquivos Base"
                />

                <div className="mt-auto pt-8">
                  <button
                    disabled={initialFiles.length === 0}
                    onClick={() => setStep('updated')}
                    className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold text-lg hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-blue-100 flex items-center justify-center gap-3"
                  >
                    Próximo Passo <ChevronRight size={20} />
                  </button>
                </div>
              </motion.div>
            )}

            {step === 'updated' && (
              <motion.div
                key="updated"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="col-span-12 lg:col-span-8 bg-white rounded-[2rem] border border-slate-200 p-8 shadow-sm flex flex-col"
              >
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white font-black italic text-lg">02</div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-800">Segundo Envio</h2>
                    <p className="text-slate-500 text-sm">Conjunto atualizado para filtrar apenas novidades.</p>
                  </div>
                </div>

                <Dropzone 
                  onFiles={(f) => processFiles(f, 'updated')} 
                  isProcessing={isProcessing}
                  count={updatedFiles.length}
                />

                <FileListDisplay 
                  files={updatedFiles} 
                  onRemove={(i) => removeFile(i, 'updated')} 
                  title="Novos Arquivos para Analisar"
                />

                <div className="mt-auto pt-8">
                  <button
                    disabled={updatedFiles.length === 0}
                    onClick={() => setStep('results')}
                    className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold text-lg hover:bg-slate-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-slate-200 flex items-center justify-center gap-3"
                  >
                    Analisar Diferenças <CheckCircle2 size={20} />
                  </button>
                </div>
              </motion.div>
            )}

            {step === 'results' && (
              <motion.div
                key="results"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="col-span-12 lg:col-span-7 bg-blue-600 rounded-[2.5rem] p-8 md:p-12 text-white shadow-2xl shadow-blue-200 flex flex-col relative overflow-hidden"
              >
                <div className="absolute top-8 right-8">
                  <span className="px-4 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-widest text-white border border-white/20">Processado</span>
                </div>
                
                <div className="mb-10">
                  <h2 className="text-3xl font-black mb-3">PDFs Únicos Encontrados</h2>
                  <p className="text-blue-100 text-lg font-medium opacity-80 italic">Exibindo apenas arquivos ausentes no primeiro envio</p>
                </div>

                <div className="flex-grow space-y-4 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/20">
                  {newFiles.length > 0 ? (
                    newFiles.map((file, idx) => (
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        key={file.id}
                        className="bg-white/10 backdrop-blur-sm p-6 rounded-3xl border border-white/20 flex items-center justify-between group hover:bg-white/15 transition-all"
                      >
                        <div className="flex flex-col gap-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-lg truncate" title={file.name}>{file.name}</span>
                            <span className="shrink-0 text-[10px] font-bold bg-white text-blue-600 px-2 py-0.5 rounded-full">NOVO</span>
                          </div>
                          <span className="text-xs text-blue-100/70 font-medium">Data de entrada: {new Date().toLocaleDateString()}</span>
                        </div>
                        <div className="text-right hidden sm:block shrink-0">
                          <p className="text-sm font-black text-white">{(file.size / 1024 / 1024).toFixed(2)}</p>
                          <p className="text-[10px] font-bold text-blue-200 uppercase tracking-tighter">MB SIZE</p>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center opacity-60 py-20">
                      <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mb-6 border border-white/20">
                        <AlertCircle size={40} />
                      </div>
                      <p className="text-xl font-bold">Nenhum novo arquivo</p>
                      <p className="text-blue-100">O segundo envio é idêntico ao primeiro.</p>
                    </div>
                  )}
                </div>

                {newFiles.length > 0 && (
                  <button 
                    onClick={handleDownload}
                    disabled={isDownloading}
                    className="mt-8 w-full py-5 bg-white text-blue-600 rounded-3xl font-black text-xl hover:bg-blue-50 transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-wait"
                  >
                    {isDownloading ? (
                      <>
                        <Loader2 className="animate-spin" size={24} />
                        Gerando ZIP...
                      </>
                    ) : (
                      <>
                        <Download size={24} />
                        Baixar Selecionados
                      </>
                    )}
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Side Info Panels (Visible on steps 1/2 or as stats on step 3) */}
          <div className="col-span-12 lg:col-span-4 xl:col-span-4 flex flex-col gap-6">
            {step === 'results' ? (
              <>
                <motion.div 
                   initial={{ opacity: 0, x: 20 }}
                   animate={{ opacity: 1, x: 0 }}
                   className="bg-white rounded-[2rem] border border-slate-200 p-8 shadow-sm"
                >
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-8">Resumo da Lógica</h3>
                  <div className="space-y-8">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-4xl font-black text-slate-800 italic leading-none">{updatedFiles.length}</div>
                        <div className="text-xs text-slate-500 font-bold uppercase mt-1 tracking-tight">Arquivos Analisados</div>
                      </div>
                      <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300">
                        <FileText size={20} />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-4xl font-black text-amber-500 italic leading-none">{updatedFiles.length - newFiles.length}</div>
                        <div className="text-xs text-slate-500 font-bold uppercase mt-1 tracking-tight">Duplicatas Filtradas</div>
                      </div>
                      <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-300">
                        <FileMinus size={20} />
                      </div>
                    </div>
                    <div className="pt-6 border-t border-slate-100">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse"></div>
                        <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Identificação por Nome</span>
                      </div>
                    </div>
                  </div>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, x: 20, delay: 0.1 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-slate-900 rounded-[2rem] p-8 text-white flex flex-col justify-between min-h-[200px]"
                >
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Efficiency Rate</span>
                    <span className="text-blue-400 text-xs font-bold px-2 py-0.5 bg-white/5 rounded-full">LIVE</span>
                  </div>
                  <div className="flex items-baseline gap-3">
                    <span className="text-6xl font-black tracking-tighter italic">
                      {updatedFiles.length > 0 ? Math.round(((updatedFiles.length - newFiles.length) / updatedFiles.length) * 100) : 0}%
                    </span>
                    <span className="text-slate-400 text-sm font-medium">economia de processamento</span>
                  </div>
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden mt-6">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${updatedFiles.length > 0 ? Math.round(((updatedFiles.length - newFiles.length) / updatedFiles.length) * 100) : 0}%` }}
                      className="h-full bg-blue-500"
                    />
                  </div>
                </motion.div>
                
                <motion.div 
                  initial={{ opacity: 0, x: 20, delay: 0.2 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-amber-50 rounded-[2rem] border border-amber-100 p-8 flex flex-col justify-center text-center italic"
                >
                  <div className="w-14 h-14 bg-amber-200/50 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                    <span className="text-amber-700 font-black text-2xl">!</span>
                  </div>
                  <h4 className="text-sm font-black text-amber-900 mb-2 uppercase tracking-tight">Dica de Comparação</h4>
                  <p className="text-xs text-amber-800 leading-relaxed font-medium">
                    A verificação é feita exatamente pelo nome do arquivo. Diferentes nomes serão tratados como arquivos novos.
                  </p>
                </motion.div>
              </>
            ) : (
              <div className="bg-white rounded-[2rem] border border-slate-200 p-8 shadow-sm">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Como funciona</h3>
                <div className="space-y-8">
                  <div className="flex gap-4">
                    <div className="shrink-0 w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">1</div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">Suba o histórico</p>
                      <p className="text-xs text-slate-500 mt-1">Carregue todos os arquivos que você já tem registrados.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="shrink-0 w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold">2</div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">Suba a remessa nova</p>
                      <p className="text-xs text-slate-500 mt-1">O sistema analisa o conteúdo binário de cada arquivo.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="shrink-0 w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">3</div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">Extraia a diferença</p>
                      <p className="text-xs text-slate-500 mt-1">Gere uma lista limpa apenas com os novos documentos.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

function StepIndicator({ active, done, number, label, onClick, disabled }: { 
  active: boolean, 
  done: boolean, 
  number: number, 
  label: string, 
  onClick: () => void,
  disabled?: boolean
}) {
  return (
    <button 
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center gap-3 shrink-0 group transition-all ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <div className={`
        w-10 h-10 rounded-2xl flex items-center justify-center text-sm font-black transition-all
        ${done ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-100' : active ? 'bg-blue-600 text-white ring-4 ring-blue-50 shadow-lg shadow-blue-100' : 'bg-slate-200 text-slate-500'}
      `}>
        {done ? <CheckCircle2 size={18} /> : number}
      </div>
      <span className={`text-sm font-bold uppercase tracking-tight ${active ? 'text-blue-600' : 'text-slate-500 group-hover:text-slate-900'}`}>
        {label}
      </span>
    </button>
  );
}

function Dropzone({ onFiles, isProcessing, count }: { onFiles: (f: FileList | null) => void, isProcessing: boolean, count: number }) {
  return (
    <div className="relative group">
      <label className={`
        relative flex flex-col items-center justify-center border-2 border-dashed rounded-[2rem] p-16 transition-all cursor-pointer
        ${isProcessing ? 'border-blue-300 bg-blue-50/30' : 'border-slate-200 hover:border-blue-400 hover:bg-slate-50'}
      `}>
        <input 
          type="file" 
          multiple 
          accept=".pdf" 
          className="absolute inset-0 opacity-0 cursor-pointer"
          onChange={(e) => onFiles(e.target.files)}
          disabled={isProcessing}
        />
        {isProcessing ? (
          <div className="flex flex-col items-center gap-4">
            <RefreshCcw size={40} className="text-blue-500 animate-spin" />
            <p className="text-blue-600 font-bold italic text-lg uppercase tracking-wider">Processando arquivos...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="bg-slate-100 p-5 rounded-3xl group-hover:scale-110 group-hover:bg-blue-50 group-hover:text-blue-600 transition-all duration-300">
              <FileUp size={40} className="text-slate-400 transition-colors" />
            </div>
            <div>
              <p className="font-black text-slate-800 text-xl tracking-tight">Solte seus PDFs aqui</p>
              <p className="text-xs text-slate-400 mt-2 font-medium uppercase tracking-widest">Apenas arquivos .pdf permitidos</p>
            </div>
          </div>
        )}
      </label>
    </div>
  );
}

function FileListDisplay({ files, onRemove, title }: { files: FileInfo[], onRemove: (i: number) => void, title: string }) {
  if (files.length === 0) return null;

  return (
    <div className="mt-10 overflow-hidden">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">{title} • {files.length} ITEMS</h3>
      </div>
      <div className="max-h-[280px] overflow-y-auto pr-3 space-y-3 scrollbar-thin">
        <AnimatePresence initial={false}>
          {files.map((file, idx) => (
            <motion.div
              key={file.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-2xl group hover:border-slate-300 hover:bg-white transition-all shadow-sm shadow-transparent hover:shadow-slate-100"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="bg-white p-2 rounded-lg shadow-sm border border-slate-100">
                  <FileText size={18} className="text-blue-500 shrink-0" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-700 truncate" title={file.name}>{file.name}</p>
                  <p className="text-[9px] text-slate-400 uppercase tracking-widest font-mono font-bold mt-1">Identificador: PDF-DOC</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="hidden sm:block text-[10px] font-black text-slate-300 uppercase">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                <button 
                  onClick={() => onRemove(idx)}
                  className="text-slate-300 hover:text-red-500 p-2.5 hover:bg-red-50 rounded-xl transition-all"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
