
import { useRef, useState } from "react";

function App() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const resultsRef = useRef(null);

  const handleClear = () => {
    setMessage("");
    setResult(null);
    setError("");
  };
  //ensures request is at min word limit
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (message.trim().length < 10) {
      setError("Please paste a little more of the email before analyzing it.");
      return;
    }

    setLoading(true);
    setResult(null);
    setError("");

    try {
      const response = await fetch("/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: message.trim()
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to analyze email.");
      }

      setResult(data);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

    //risk class
  const riskClass = (risk) => {
    const value = String(risk || "").toLowerCase();

    if (value.includes("high") || value.includes("critical")) {
      return "bg-[#f8e7e7] text-[#a83e43]";
    }

    if (value.includes("medium") || value.includes("suspicious")) {
      return "bg-[#f7efdf] text-[#94651d]";
    }

    if (value.includes("low") || value.includes("safe")) {
      return "bg-[#e5f2ea] text-[#327354]";
    }

    return "bg-[#e9e9ed] text-navy";
  };

  const asList = (items) => {
    if (Array.isArray(items)) return items;
    if (typeof items === "string" && items.trim()) return [items];
    return [];
  };

  const itemText = (item) => {
    if (typeof item === "string") return item;

    return item.description || item.message ||
      item.name || item.title || JSON.stringify(item);
  };

  const renderList = (items) => (
    <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed">
      {items.map((item, index) => (
        <li key={index}>{itemText(item)}</li>
      ))}
    </ul>
  );

  return (
    <div className="min-h-screen bg-white font-sans text-black">

      <header className="flex min-h-[88px] items-center justify-between gap-5 px-[5%] py-5 lg:px-[3.1%]">
        <a href="/" className="text-[24px] font-medium tracking-[-1.8px] sm:text-[28px]">
          Phish Outta Water
        </a>

        <a href="#learn" className="rounded-full bg-navy px-4 py-3 text-center text-xs font-bold text-white transition hover:bg-navy-dark sm:px-6">
          Learn About Phishing ↗
        </a>
      </header>

      <main className="mx-auto mt-9 w-[90%] max-w-[1440px] lg:mt-12 lg:w-[93.8%]">

        <section className="mb-6 text-center">
          <h1 className="font-display text-[34px] font-bold leading-tight tracking-[-1.5px] sm:text-5xl lg:text-[56px]">
            Paste a Suspicious Email Here
          </h1>

          <p className="mt-2 font-display text-xl leading-snug sm:text-2xl lg:text-4xl">
            Our Agent will check for common phishing indicators.
          </p>
        </section>

        <form onSubmit={handleSubmit} className="text-center">

          <label htmlFor="email-message" className="sr-only">
            Suspicious email content
          </label>

          <textarea
            id="email-message"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Paste the email's subject and message here..."
            minLength={10}
            required
            spellCheck="true"
            className="block min-h-[300px] w-full resize-y rounded-[22px] border-[5px] border-navy bg-[#eaeaec] p-[18px] text-left text-base leading-relaxed outline-none transition placeholder:text-[#85858c] focus:border-[#53649c] focus:ring-4 focus:ring-navy/10 sm:min-h-[380px] sm:rounded-[30px] sm:border-[7px] sm:p-[25px] sm:text-[17px]"
          />

          <div className="flex min-h-[35px] items-center justify-between px-2 pt-1 text-xs text-[#707078]">
            <span>
              {message.length} {message.length === 1 ? "character" : "characters"}
            </span>

            <button
              type="button"
              onClick={handleClear}
              className="py-1 pl-3 text-navy hover:underline"
            >
              Clear text
            </button>
          </div>

          <div className="h-px bg-[#e5e5e8]"></div>

          <button
            type="submit"
            disabled={loading}
            className="mx-auto mt-7 inline-flex min-h-[60px] min-w-[220px] items-center justify-center gap-3 rounded-full bg-navy px-8 py-4 font-display text-xl text-white transition hover:-translate-y-0.5 hover:bg-navy-dark disabled:cursor-wait disabled:opacity-75 sm:mt-10 sm:min-h-[69px] sm:min-w-[232px]"
          >
            {loading ? "Analyzing..." : "Analyze Message"}

            {loading && (
              <span className="h-[17px] w-[17px] animate-spin rounded-full border-2 border-white/40 border-t-white"></span>
            )}
          </button>

          <p className="mt-3 text-xs text-[#707078]">
            Don't include passwords, payment details, or other sensitive information.
          </p>
        </form>

        {error && (
          <p className="mt-5 text-center text-sm text-red-600" role="alert">
            {error}
          </p>
        )}

        {result && (
          <section
            ref={resultsRef}
            aria-live="polite"
            className="mt-12 rounded-2xl border border-[#e5e5e8] bg-[#fbfbfc] p-5 sm:p-8"
          >
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="mb-2 text-[11px] font-bold tracking-[1.7px] text-navy">
                  ANALYSIS RESULTS
                </p>
                <h2 className="text-2xl font-semibold">
                  Your email analysis
                </h2>
              </div>

              <span className={`rounded-full px-4 py-2 text-xs font-bold ${riskClass(result.riskLevel)}`}>
                {result.riskLevel || "Analysis complete"}
              </span>
            </div>

            <p className="my-5 leading-relaxed">
              {result.summary || "The analysis is complete."}
            </p>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

              <div className="rounded-xl border border-[#e5e5e8] bg-white p-5">
                <h3 className="mb-3 text-[15px] font-bold">
                  What we noticed
                </h3>

                {renderList(asList(result.indicators))}

                {asList(result.indicators).length === 0 && (
                  <p className="text-sm text-[#707078]">
                    No specific indicators were returned.
                  </p>
                )}
              </div>

              <div className="rounded-xl border border-[#e5e5e8] bg-white p-5">
                <h3 className="mb-3 text-[15px] font-bold">
                  What you should do
                </h3>

                {renderList(asList(result.recommendations))}

                {asList(result.recommendations).length === 0 && (
                  <p className="text-sm text-[#707078]">
                    No recommendations were returned.
                  </p>
                )}
              </div>

            </div>

            <p className="mt-5 text-xs leading-relaxed text-[#707078]">
              This tool can make mistakes. Verify suspicious emails through an official website or trusted contact.
            </p>
          </section>
        )}

      </main>

      <footer className="mx-auto mt-12 flex min-h-[115px] w-[90%] max-w-[1440px] flex-wrap items-center gap-x-8 gap-y-4 border-t border-[#e5e5e8] py-7 lg:w-[93.8%]">
        <a href="/" className="font-bold text-black">
          🚫 Phish Outta Water
        </a>

        <nav className="flex gap-7 text-sm text-[#707078]">
          <a href="#email-message" className="hover:text-navy">Features</a>
          <a href="#learn" className="hover:text-navy">Learn more</a>
        </nav>

        <span className="text-xs text-[#707078] sm:ml-auto">
          A student project for learning email security.
        </span>
      </footer>

    </div>
  );
}

export default App;
