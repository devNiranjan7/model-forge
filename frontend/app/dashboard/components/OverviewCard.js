export default function OverviewCard({ card }) {
    return (
        <article className="rounded-2xl border border-(--border) bg-white p-5">
            <div className="flex items-start justify-between gap-3">
                <p className="text-sm text-(--muted)">{card.label}</p>
                <span
                    style={{ backgroundColor: card.color }}
                    className="flex h-9 w-9 items-center justify-center rounded-xl text-lg"
                    aria-hidden="true"
                >
                    {card.icon}
                </span>
            </div>
            <p className="mt-5 text-3xl font-semibold tracking-tight">{card.value}</p>
            <p className="mt-2 text-xs text-(--muted)">{card.note}</p>
        </article>
    );
}
