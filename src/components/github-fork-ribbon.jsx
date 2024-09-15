import Link from 'next/link';

export default function GitHubForkRibbon({ href, dataRibbon, title }) {
  return (
    <Link 
      className="github-fork-ribbon left-top" 
      href={href} 
      data-ribbon={dataRibbon} 
      title={title}
    >
      {dataRibbon}
    </Link>
  );
}
