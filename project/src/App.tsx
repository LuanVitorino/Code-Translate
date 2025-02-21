import React, { useState } from 'react';
import { Code2, Moon, Sun } from 'lucide-react';
import  MistralClient  from "@mistralai/mistralai";

// Lista de linguagens de programação suportadas pelo analisador
const LINGUAGENS_SUPORTADAS = [
  'JavaScript',
  'Python',
  'Java',
  'C++',
  'C#',
  'PHP',
  'Ruby',
  'Swift',
  'Go',
  'TypeScript'
];

// Inicialização do cliente Mistral AI com a chave da API
const mistral = new MistralClient(import.meta.env.VITE_MISTRAL_API_KEY);

function App() {
  // Estados para controlar a interface e funcionalidades
  const [linguagemSelecionada, setLinguagemSelecionada] = useState('JavaScript'); // Controla a linguagem selecionada
  const [codigoFonte, setCodigoFonte] = useState(''); // Armazena o código inserido pelo usuário
  const [codigoExplicado, setCodigoExplicado] = useState(''); // Armazena a explicação do código
  const [carregando, setCarregando] = useState(false); // Controla o estado de carregamento
  const [temaEscuro, setTemaEscuro] = useState(false); // Controla o tema da interface
  const [mensagemErro, setMensagemErro] = useState<string>(''); // Mensagem de erro global

  // Função para alternar entre tema claro e escuro
  const alternarTema = () => {
    setTemaEscuro(!temaEscuro);
  };

  // Função para tratar erros da API Mistral
  const tratarErroAPI = (erro: any) => {
    if (erro.response?.status === 429) {
      return 'Muitas requisições em um curto período. Aguarde um momento e tente novamente.';
    } else if (erro.response?.status === 401) {
      return 'Erro de autenticação. Verifique sua chave API.';
    }
    return 'Ocorreu um erro ao processar o código. Por favor, tente novamente.';
  };

  // Função principal para analisar e explicar o código
  const explicarCodigo = async () => {
    // Verifica o limite de linhas
    if (codigoFonte.split('\n').length > 1000) {
      setMensagemErro('O código excede o limite de 1000 linhas');
      return;
    }

    // Reseta estados e inicia o processamento
    setCarregando(true);
    setMensagemErro('');
    setCodigoExplicado('');

    try {
      // Faz a requisição para a API do Mistral
      const chatResponse = await mistral.chat({
        model: "mistral-tiny",
        messages: [
          {
            role: "system",
            content: "Você é um especialista em análise de código. Sua tarefa é explicar o código de forma clara e didática, adicionando comentários que explicam a função de cada parte do código."
          },
          {
            role: "user",
            content: `
              Analise o seguinte código em ${linguagemSelecionada} e forneça:
              Uma explicação detalhada do código, adicionando comentários que explicam a função de cada parte do código.
              Mantenha o código original e adicione comentários explicativos acima de cada função ou bloco importante.

              Código:
              ${codigoFonte}
            `
          }
        ]
      });

      const resposta = chatResponse.choices[0].message.content;
      setCodigoExplicado(resposta);
    } catch (erro: any) {
      console.error('Erro ao processar o código:', erro);
      setMensagemErro(tratarErroAPI(erro));
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className={`min-h-screen ${temaEscuro ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Cabeçalho da aplicação */}
      <header className={`${temaEscuro ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Code2 className={`h-6 w-6 ${temaEscuro ? 'text-indigo-400' : 'text-indigo-600'}`} />
            <h1 className={`text-xl font-semibold ${temaEscuro ? 'text-white' : 'text-gray-900'}`}>
              Explicador de Código
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            {/* Seletor de linguagem */}
            <div className="relative inline-block text-left">
              <div className="flex items-center space-x-2">
                <span className={`text-sm ${temaEscuro ? 'text-gray-300' : 'text-gray-500'}`}>
                  Linguagem:
                </span>
                <select
                  value={linguagemSelecionada}
                  onChange={(e) => setLinguagemSelecionada(e.target.value)}
                  className={`block w-40 rounded-md shadow-sm sm:text-sm ${
                    temaEscuro
                      ? 'bg-gray-700 border-gray-600 text-white focus:border-indigo-500'
                      : 'border-gray-300 focus:border-indigo-500'
                  }`}
                >
                  {LINGUAGENS_SUPORTADAS.map(lang => (
                    <option key={lang} value={lang}>{lang}</option>
                  ))}
                </select>
              </div>
            </div>
            {/* Botão de alternar tema */}
            <button
              onClick={alternarTema}
              className={`p-2 rounded-md ${
                temaEscuro
                  ? 'bg-gray-700 hover:bg-gray-600'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              {temaEscuro ? (
                <Sun className="h-5 w-5 text-yellow-400" />
              ) : (
                <Moon className="h-5 w-5 text-gray-600" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Conteúdo principal */}
      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {mensagemErro && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md flex items-center">
            <p>{mensagemErro}</p>
          </div>
        )}
        <div className="grid grid-cols-2 gap-6">
          {/* Editor de código fonte */}
          <div className={`${temaEscuro ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm`}>
            <div className={`p-4 border-b ${temaEscuro ? 'border-gray-700' : 'border-gray-200'}`}>
              <h2 className={`text-lg font-medium ${temaEscuro ? 'text-white' : 'text-gray-900'}`}>
                Código Fonte
              </h2>
              <p className={`mt-1 text-sm ${temaEscuro ? 'text-gray-400' : 'text-gray-500'}`}>
                Cole seu código aqui (máximo 1000 linhas)
              </p>
            </div>
            <div className="p-4">
              <textarea
                value={codigoFonte}
                onChange={(e) => setCodigoFonte(e.target.value)}
                className={`w-full h-[600px] font-mono text-sm p-4 rounded-md ${
                  temaEscuro
                    ? 'bg-gray-900 text-gray-100 border-gray-700 focus:border-indigo-500'
                    : 'border focus:border-indigo-500'
                }`}
                placeholder="Cole seu código aqui..."
              />
              <button
                onClick={explicarCodigo}
                disabled={carregando || !codigoFonte}
                className={`mt-4 px-4 py-2 rounded-md text-white font-medium ${
                  carregando || !codigoFonte
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-700'
                }`}
              >
                {carregando ? 'Processando...' : 'Explicar Código'}
              </button>
            </div>
          </div>

          {/* Visualização do código explicado */}
          <div className={`${temaEscuro ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm`}>
            <div className={`p-4 border-b ${temaEscuro ? 'border-gray-700' : 'border-gray-200'}`}>
              <h2 className={`text-lg font-medium ${temaEscuro ? 'text-white' : 'text-gray-900'}`}>
                Código Explicado
              </h2>
              <p className={`mt-1 text-sm ${temaEscuro ? 'text-gray-400' : 'text-gray-500'}`}>
                Código com comentários explicativos
              </p>
            </div>
            <div className="p-4">
              <pre className={`w-full h-[600px] font-mono text-sm p-4 rounded-md overflow-auto whitespace-pre-wrap ${
                temaEscuro
                  ? 'bg-gray-900 text-gray-100 border-gray-700'
                  : 'border'
              }`}>
                {codigoExplicado}
              </pre>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;