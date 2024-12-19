'use client';

import DistribuicaoTable from '@/components/DistribuicaoTabela';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import {
  Controller,
  FormProvider,
  useFieldArray,
  useForm
} from 'react-hook-form';
import { CiCirclePlus } from 'react-icons/ci';
import { FaTrashAlt } from 'react-icons/fa';
import { z } from 'zod';

interface Veiculo {
  placa: string;
  capacidadeTanque: number;
  tipoCombustivel: string;
}

interface DistribuicaoVeiculo {
  placa: string;
  tipoCombustivel: string;
  quantidade: number;
}

interface DistribuicaoDia {
  dia: number | null;
  veiculos: DistribuicaoVeiculo[];
}

const distribuidorDeLitrosForm = z.object({
  veiculos: z.array(
    z.object({
      placa: z.string({ required_error: 'A placa do veículo é obrigatória' }),
      capacidadeTanque: z
        .number()
        .min(1, 'A capacidade do tanque deve ser maior que 0'),
      tipoCombustivel: z
        .string()
        .nonempty('O tipo de combustível é obrigatório')
    })
  ),
  gasolina: z.number().optional(),
  etanol: z.number().optional(),
  dieselComum: z.number().optional(),
  dieselS10: z.number().optional(),
  diasDoMes: z.number().min(1, 'O número de dias do mês deve ser maior que 0'),
  diasAleatorios: z.boolean().default(false)
});

type DistribuidorDeLitrosForm = z.infer<typeof distribuidorDeLitrosForm>;

export default function DistribuidorDeLitros() {
  const [tabelaDados, setTabelaDados] = useState<DistribuicaoDia[]>([]);

  const methods = useForm<DistribuidorDeLitrosForm>({
    resolver: zodResolver(distribuidorDeLitrosForm),
    defaultValues: {
      veiculos: [
        { capacidadeTanque: 0, tipoCombustivel: 'gasolina', placa: '' }
      ],
      gasolina: 0,
      etanol: 0,
      dieselComum: 0,
      dieselS10: 0,
      diasDoMes: 0,
      diasAleatorios: false
    }
  });

  const { register, handleSubmit, formState, control } = methods;
  const fieldArrayVeiculos = useFieldArray({
    control,
    name: 'veiculos'
  });

  function handleGenerateData(data: DistribuidorDeLitrosForm) {
    const {
      veiculos,
      gasolina = 0,
      etanol = 0,
      dieselComum = 0,
      dieselS10 = 0,
      diasDoMes,
      diasAleatorios
    } = data;

    // Função para gerar um valor aleatório entre min e max
    const randomValue = (min: number, max: number): number =>
      Math.random() * (max - min) + min;

    // Função para distribuir combustível para um veículo em um dia específico
    const distribuirCombustivel = (
      veiculo: Veiculo,
      combustivelDisponivel: number
    ): number => {
      // Volume mínimo de 6L por abastecimento
      const quantidade = Math.min(
        randomValue(
          veiculo.capacidadeTanque - veiculo.capacidadeTanque * 0.2,
          veiculo.capacidadeTanque
        ),
        combustivelDisponivel
      );
      return quantidade >= 6 ? quantidade : 0; // Garantir mínimo de 6L
    };

    // Inicializa o array que armazenará os dados de distribuição
    const distribuicao: DistribuicaoDia[] = Array.from(
      { length: diasDoMes },
      (_, index) => ({
        dia: index + 1,
        veiculos: veiculos.map((veiculo) => ({
          placa: veiculo.placa,
          tipoCombustivel: veiculo.tipoCombustivel,
          quantidade: 0
        }))
      })
    );

    const combustiveis = { gasolina, etanol, dieselComum, dieselS10 };

    // Regras de distribuição
    for (let dia = 0; dia < diasDoMes; dia++) {
      distribuicao[dia].dia = dia + 1;

      // Escolher veículos aleatoriamente para não abastecer todos os veículos todos os dias
      const veiculosAleatorios = [...veiculos].sort(() => 0.5 - Math.random());

      veiculosAleatorios.forEach((veiculo) => {
        // Apenas abastecer em dias aleatórios (ex.: 50% de chance)
        if (!diasAleatorios || Math.random() < 0.5) {
          let quantidade = 0;
          switch (veiculo.tipoCombustivel) {
            case 'gasolina':
              quantidade = distribuirCombustivel(
                veiculo,
                combustiveis.gasolina
              );
              combustiveis.gasolina -= quantidade;
              break;
            case 'etanol':
              quantidade = distribuirCombustivel(veiculo, combustiveis.etanol);
              combustiveis.etanol -= quantidade;
              break;
            case 'dieselComum':
              quantidade = distribuirCombustivel(
                veiculo,
                combustiveis.dieselComum
              );
              combustiveis.dieselComum -= quantidade;
              break;
            case 'dieselS10':
              quantidade = distribuirCombustivel(
                veiculo,
                combustiveis.dieselS10
              );
              combustiveis.dieselS10 -= quantidade;
              break;
          }

          // Adicionar quantidade distribuída ao veículo no dia
          if (quantidade > 0) {
            const veiculoDistribuicao = distribuicao[dia].veiculos.find(
              (v) => v.placa === veiculo.placa
            );
            if (veiculoDistribuicao) {
              veiculoDistribuicao.quantidade += quantidade;
            }
          }
        }
      });
    }

    // Redistribuir combustível remanescente (aplica regras mínimas também)
    const distribuirCombustivelRestante = (tipo: keyof typeof combustiveis) => {
      while (combustiveis[tipo] > 0) {
        const veiculoAleatorio =
          veiculos[Math.floor(Math.random() * veiculos.length)];
        const diaAleatorio = Math.floor(Math.random() * diasDoMes);
        const quantidade = distribuirCombustivel(
          veiculoAleatorio,
          combustiveis[tipo]
        );
        combustiveis[tipo] -= quantidade;
        if (quantidade > 0) {
          const veiculoDistribuicao = distribuicao[diaAleatorio].veiculos.find(
            (v) => v.placa === veiculoAleatorio.placa
          );
          if (veiculoDistribuicao) {
            veiculoDistribuicao.quantidade += quantidade;
          }
        }
      }
    };

    ['gasolina', 'etanol', 'dieselComum', 'dieselS10'].forEach((tipo) =>
      distribuirCombustivelRestante(tipo as keyof typeof combustiveis)
    );

    // Configura os dados gerados na tabela
    setTabelaDados(distribuicao);
  }

  return (
    <main className="flex flex-col items-center gap-8 py-10 px-4 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800">
        Distribuidor de Litros
      </h1>
      <p className="text-center text-gray-600 max-w-md">
        Insira os dados para distribuir os litros de combustível de forma
        automática.
      </p>
      <FormProvider {...methods}>
        <form
          onSubmit={handleSubmit(handleGenerateData)}
          className="w-full max-w-2xl space-y-6 bg-white shadow-lg p-6 rounded-xl"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="gasolina"
                className="block text-sm font-medium text-gray-700"
              >
                Quantidade de Gasolina em Litros
              </label>
              <input
                type="number"
                id="gasolina"
                className="mt-1 block w-full p-2 border rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                {...register('gasolina', { valueAsNumber: true })}
              />
              {formState.errors.gasolina && (
                <p className="text-red-500 text-sm">
                  {formState.errors.gasolina.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="etanol"
                className="block text-sm font-medium text-gray-700"
              >
                Quantidade de Etanol em Litros
              </label>
              <input
                type="number"
                id="etanol"
                className="mt-1 block w-full p-2 border rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                {...register('etanol', { valueAsNumber: true })}
              />
              {formState.errors.etanol && (
                <p className="text-red-500 text-sm">
                  {formState.errors.etanol.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="dieselComum"
                className="block text-sm font-medium text-gray-700"
              >
                Quantidade de Diesel Comum em Litros
              </label>
              <input
                type="number"
                id="dieselComum"
                className="mt-1 block w-full p-2 border rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                {...register('dieselComum', { valueAsNumber: true })}
              />
              {formState.errors.dieselComum && (
                <p className="text-red-500 text-sm">
                  {formState.errors.dieselComum.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="dieselS10"
                className="block text-sm font-medium text-gray-700"
              >
                Quantidade de Diesel S10 em Litros
              </label>
              <input
                type="number"
                id="dieselS10"
                className="mt-1 block w-full p-2 border rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                {...register('dieselS10', { valueAsNumber: true })}
              />
              {formState.errors.dieselS10 && (
                <p className="text-red-500 text-sm">
                  {formState.errors.dieselS10.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="diasMes"
                className="block text-sm font-medium text-gray-700"
              >
                Números de Dias do Mês
              </label>
              <input
                type="number"
                id="diasMes"
                className="mt-1 block w-full p-2 border rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                {...register('diasDoMes', { valueAsNumber: true })}
              />
              {formState.errors.diasDoMes && (
                <p className="text-red-500 text-sm">
                  {formState.errors.diasDoMes.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="diasAleatorios"
                className="block text-sm font-medium text-gray-700"
              >
                Incluir Aleatoriedade de Dias
              </label>
              <input
                type="checkbox"
                id="diasAleatorios"
                className="mt-1 block w-full p-2 border rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                {...register('diasAleatorios')}
              />
              {formState.errors.diasAleatorios && (
                <p className="text-red-500 text-sm">
                  {formState.errors.diasAleatorios.message}
                </p>
              )}
            </div>
          </div>

          {/* Campos Dinâmicos */}
          <div className="w-full">
            <div className="space-y-4 w-full">
              <h3 className="text-lg font-semibold text-gray-700">Veículos</h3>
              {fieldArrayVeiculos.fields.map((field, index) => (
                <div
                  key={field.id}
                  className="flex items-center justify-between gap-4"
                >
                  <div className="w-full">
                    <label
                      htmlFor="placa"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Placa do Veículo
                    </label>
                    <input
                      type="text"
                      {...register(`veiculos.${index}.placa`)}
                      className="block w-full p-2 border rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    {formState.errors.veiculos && (
                      <p className="text-red-500 text-sm">
                        {formState.errors.veiculos.message}
                      </p>
                    )}
                  </div>

                  <div className="w-full">
                    <label
                      htmlFor="capacidadeTanque"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Capacidade do Tanque em Litros
                    </label>
                    <input
                      type="number"
                      {...register(`veiculos.${index}.capacidadeTanque`, {
                        valueAsNumber: true
                      })}
                      className="block w-full p-2 border rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    {formState.errors.veiculos && (
                      <p className="text-red-500 text-sm">
                        {formState.errors.veiculos.message}
                      </p>
                    )}
                  </div>

                  <Controller
                    control={control}
                    name={`veiculos.${index}.tipoCombustivel`}
                    render={({ field }) => (
                      <div className="w-full">
                        <label
                          htmlFor="tipoCombustivel"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Tipo de Combustivel
                        </label>
                        <select
                          {...field}
                          name="tipoCombustivel"
                          className="w-full"
                        >
                          <option value="gasolina">Gasolina</option>
                          <option value="etanol">Etanol</option>
                          <option value="dieselComum">Diesel Comum</option>
                          <option value="dieselS10">Diesel S10</option>
                        </select>
                        {formState.errors.veiculos && (
                          <p className="text-red-500 text-sm">
                            {formState.errors.veiculos.message}
                          </p>
                        )}
                      </div>
                    )}
                  />

                  <button
                    type="button"
                    className="text-red-500 hover:text-red-700"
                    onClick={() => fieldArrayVeiculos.remove(index)}
                  >
                    <FaTrashAlt size={18} />
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="inline-flex items-center px-3 py-2 text-sm font-semibold text-white bg-green-600 hover:bg-green-700 rounded-lg"
                onClick={() =>
                  fieldArrayVeiculos.append({
                    placa: '',
                    capacidadeTanque: 0,
                    tipoCombustivel: 'gasolina'
                  })
                }
              >
                <CiCirclePlus size={20} className="mr-2" /> Adicionar
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none"
          >
            Gerar Dados
          </button>
        </form>
      </FormProvider>
      Tabela de Resultados
      {tabelaDados.length > 0 && (
        <div className="overflow-x-auto">
          <DistribuicaoTable distribuicao={tabelaDados} />
        </div>
      )}
    </main>
  );
}
