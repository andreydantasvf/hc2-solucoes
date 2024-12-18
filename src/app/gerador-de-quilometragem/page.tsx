'use client';

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

interface DadoTabela {
  litros: number;
  kmPorLitro: number;
  totalKm: number;
  kmFinal: number;
}

const geradorQuilometragemForm = z.object({
  mediaKm: z.number().min(0, 'A média de quilometragem deve ser maior que 0'),
  kmInicial: z.number().min(0, 'A quilometragem inicial deve ser maior que 0'),
  abastecimentos: z
    .array(z.object({ value: z.number().min(0, 'Deve ser maior que 0') }))
    .min(1, 'Adicione pelo menos um abastecimento'),
  naoRepetir: z
    .array(z.object({ value: z.number().min(0, 'Deve ser maior que 0') }))
    .min(1, 'Adicione pelo menos um número')
});

type GeradorQuilometragemForm = z.infer<typeof geradorQuilometragemForm>;

export default function GeradorDeQuilometragem() {
  const [tabelaDados, setTabelaDados] = useState<DadoTabela[]>([]);

  const methods = useForm<GeradorQuilometragemForm>({
    resolver: zodResolver(geradorQuilometragemForm),
    defaultValues: {
      abastecimentos: [{ value: 0 }],
      naoRepetir: [{ value: 0 }]
    }
  });

  const { register, handleSubmit, formState, control } = methods;
  const fieldArrayAbastecimentos = useFieldArray({
    control,
    name: 'abastecimentos'
  });
  const fieldArrayNaoRepetir = useFieldArray({
    control,
    name: 'naoRepetir'
  });

  function handleGenerateData(data: GeradorQuilometragemForm) {
    const { abastecimentos, kmInicial, mediaKm, naoRepetir } = data;
    let kmAcumulado = kmInicial;

    const dados = abastecimentos.map(({ value: litro }) => {
      const kmAleatorio = mediaKm + (Math.random() * 1 - 0.5); // Aleatório ±0.5
      const totalKm = litro * kmAleatorio;
      kmAcumulado += totalKm;

      return {
        litros: litro,
        kmPorLitro: parseFloat(kmAleatorio.toFixed(2)),
        totalKm: parseFloat(totalKm.toFixed(2)),
        kmFinal: parseFloat(kmAcumulado.toFixed(2))
      };
    });

    setTabelaDados(dados);
  }

  return (
    <main className="flex flex-col items-center gap-8 py-10 px-4 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800">
        Gerador de Quilometragem
      </h1>
      <p className="text-center text-gray-600 max-w-md">
        Insira os dados para gerar quilometragem aleatória com base em valores.
      </p>

      <FormProvider {...methods}>
        <form
          onSubmit={handleSubmit(handleGenerateData)}
          className="w-full max-w-2xl space-y-6 bg-white shadow-lg p-6 rounded-xl"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="kmInicial"
                className="block text-sm font-medium text-gray-700"
              >
                Quilometragem Inicial
              </label>
              <input
                type="number"
                id="kmInicial"
                className="mt-1 block w-full p-2 border rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                {...register('kmInicial', { valueAsNumber: true })}
              />
              {formState.errors.kmInicial && (
                <p className="text-red-500 text-sm">
                  {formState.errors.kmInicial.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="mediaKm"
                className="block text-sm font-medium text-gray-700"
              >
                Média de KM/L
              </label>
              <input
                type="number"
                id="mediaKm"
                className="mt-1 block w-full p-2 border rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                {...register('mediaKm', { valueAsNumber: true })}
              />
              {formState.errors.mediaKm && (
                <p className="text-red-500 text-sm">
                  {formState.errors.mediaKm.message}
                </p>
              )}
            </div>
          </div>

          {/* Campos Dinâmicos */}
          <div className="flex justify-between">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-700">
                Abastecimentos
              </h3>
              {fieldArrayAbastecimentos.fields.map((field, index) => (
                <div key={field.id} className="flex items-center gap-4">
                  <Controller
                    control={control}
                    name={`abastecimentos.${index}.value`}
                    render={({ field }) => (
                      <input
                        type="number"
                        {...field}
                        {...register(`abastecimentos.${index}.value`, {
                          valueAsNumber: true
                        })}
                        className="block w-full p-2 border rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    )}
                  />
                  <button
                    type="button"
                    className="text-red-500 hover:text-red-700"
                    onClick={() => fieldArrayAbastecimentos.remove(index)}
                  >
                    <FaTrashAlt size={18} />
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="inline-flex items-center px-3 py-2 text-sm font-semibold text-white bg-green-600 hover:bg-green-700 rounded-lg"
                onClick={() => fieldArrayAbastecimentos.append({ value: 0 })}
              >
                <CiCirclePlus size={20} className="mr-2" /> Adicionar
              </button>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-700">
                Não Repetir
              </h3>
              {fieldArrayNaoRepetir.fields.map((field, index) => (
                <div key={field.id} className="flex items-center gap-4">
                  <Controller
                    control={control}
                    name={`naoRepetir.${index}.value`}
                    render={({ field }) => (
                      <input
                        type="number"
                        {...field}
                        {...register(`naoRepetir.${index}.value`, {
                          valueAsNumber: true
                        })}
                        className="block w-full p-2 border rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    )}
                  />
                  <button
                    type="button"
                    className="text-red-500 hover:text-red-700"
                    onClick={() => fieldArrayNaoRepetir.remove(index)}
                  >
                    <FaTrashAlt size={18} />
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="inline-flex items-center px-3 py-2 text-sm font-semibold text-white bg-green-600 hover:bg-green-700 rounded-lg"
                onClick={() => fieldArrayNaoRepetir.append({ value: 0 })}
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

      {/* Tabela de Resultados */}
      {tabelaDados.length > 0 && (
        <div className="w-full max-w-4xl mt-10 overflow-auto">
          <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
            <thead className="bg-indigo-600 text-white">
              <tr>
                <th className="py-3 px-4 text-left">Litros</th>
                <th className="py-3 px-4 text-left">KM/L</th>
                <th className="py-3 px-4 text-left">Total KM</th>
                <th className="py-3 px-4 text-left">KM Final</th>
              </tr>
            </thead>
            <tbody>
              {tabelaDados.map((dado, index) => (
                <tr
                  key={index}
                  className={index % 2 === 0 ? 'bg-gray-100' : 'bg-white'}
                >
                  <td className="py-3 px-4 text-left">{dado.litros}</td>
                  <td className="py-3 px-4 text-left">{dado.kmPorLitro}</td>
                  <td className="py-3 px-4 text-left">{dado.totalKm}</td>
                  <td className="py-3 px-4 text-left">{dado.kmFinal}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
