export default function LessonsPage() {
  const lessons = [
    {
      title: "Private Lesson",
      details: ["1–2 students", "60–180 minutes", "All levels"],
      price: "from $120 / hr",
    },
    {
      title: "Group Lesson",
      details: ["Up to 6", "120 minutes", "Beginner–Intermediate"],
      price: "$80 / person",
    },
    {
      title: "Kids' Camp",
      details: ["Ages 6–12", "Half-day", "Snacks included"],
      price: "$150",
    },
  ];

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">Lessons</h1>
        <p className="mt-2 text-gray-600">
          Simple, transparent options for every level.
        </p>
      </header>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {lessons.map((l) => (
          <article key={l.title} className="card p-6">
            <h3 className="text-xl font-medium">{l.title}</h3>
            <ul className="mt-3 text-gray-600">
              {l.details.map((d) => (
                <li key={d}>• {d}</li>
              ))}
            </ul>
            <div className="mt-4 text-sm text-gray-500">{l.price}</div>
          </article>
        ))}
      </div>
    </div>
  );
}

