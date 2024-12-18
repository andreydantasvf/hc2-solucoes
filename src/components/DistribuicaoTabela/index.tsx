import React from 'react';

interface Veiculo {
  placa: string;
  tipoCombustivel: string;
  quantidade: number;
}

interface DistribuicaoDia {
  dia: number | null;
  veiculos: Veiculo[];
}

interface DistribuicaoTableProps {
  distribuicao: DistribuicaoDia[];
}

const DistribuicaoTable: React.FC<DistribuicaoTableProps> = ({
  distribuicao
}) => {
  const veiculos = distribuicao[0]?.veiculos.map((v) => v.placa) || [];

  return (
    <div>
      {veiculos.map((placa) => {
        const distribuicaoVeiculo = distribuicao
          .map((diaDistribuicao) => ({
            dia: diaDistribuicao.dia,
            veiculo: diaDistribuicao.veiculos.find((v) => v.placa === placa)
          }))
          .filter(
            (diaVeiculo) =>
              diaVeiculo.veiculo && diaVeiculo.veiculo.quantidade > 0
          );

        const totalAbastecido = distribuicaoVeiculo.reduce(
          (total, dv) => total + (dv.veiculo?.quantidade || 0),
          0
        );

        return (
          <div key={placa} className="mb-4">
            <h2 className="text-xl font-bold mb-2">Placa: {placa}</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-2 border">Dia</th>
                    <th className="px-4 py-2 border">Tipo de Combustível</th>
                    <th className="px-4 py-2 border">Quantidade</th>
                  </tr>
                </thead>
                <tbody>
                  {distribuicaoVeiculo.map(({ dia, veiculo }) => (
                    <tr
                      key={`${dia}-${veiculo?.placa}`}
                      className="hover:bg-gray-100"
                    >
                      <td className="px-4 py-2 border text-center">{dia}</td>
                      <td className="px-4 py-2 border text-center">
                        {veiculo?.tipoCombustivel}
                      </td>
                      <td className="px-4 py-2 border text-center">
                        {veiculo?.quantidade.toFixed(2)} L
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-gray-200 font-bold">
                    <td className="px-4 py-2 border text-center">Total</td>
                    <td className="px-4 py-2 border"></td>
                    <td className="px-4 py-2 border text-center">
                      {totalAbastecido.toFixed(2)} L
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default DistribuicaoTable;
