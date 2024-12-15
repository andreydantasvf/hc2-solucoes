export const Main = ({
  title = 'React Avançado',
  description = 'TypeScript, ReactJs, NextJs'
}) => {
  return (
    <main className="bg-zinc-900 p-2 rounded-2xl flex flex-col gap-1 items-center justify-center w-80 h-80 m-auto">
      <h1 className="text-slate-200 text-4xl">{title}</h1>
      <p className="text-slate-500">{description}</p>
    </main>
  );
};
