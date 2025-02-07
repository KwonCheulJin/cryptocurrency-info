interface Props {
  title: string;
  desc?: string;
}
export default function DetailItem({ title, desc }: Props) {
  return (
    <dl className="flex gap-1.5 items-center">
      <dt className="font-semibold text-lg">{title}</dt>
      <dd className="text-[#545454]">{desc}</dd>
    </dl>
  );
}
