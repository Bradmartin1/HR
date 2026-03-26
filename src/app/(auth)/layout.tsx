export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-full flex" style={{ backgroundColor: "#007384" }}>
      {/* Left brand panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center px-12 text-white">
        <div className="max-w-md text-center space-y-6">
          <div className="flex items-center justify-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl" style={{ backgroundColor: "#2DBDB6" }}>
              <span className="text-2xl font-bold text-white" style={{ fontFamily: "var(--font-heading)" }}>RP</span>
            </div>
          </div>
          <h1 className="text-4xl tracking-wide" style={{ fontFamily: "var(--font-heading)", letterSpacing: "0.05em" }}>
            RUSHTOWN POULTRY
          </h1>
          <p className="text-lg opacity-80">Internal HR Platform</p>
          <div className="flex justify-center gap-3 pt-4">
            {["#F15A22", "#FFC20E", "#FFEB95", "#2DBDB6"].map((color) => (
              <div key={color} className="h-3 w-3 rounded-full" style={{ backgroundColor: color }} />
            ))}
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex flex-1 items-center justify-center bg-white p-6 lg:rounded-l-3xl">
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  );
}
