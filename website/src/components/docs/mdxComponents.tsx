import type { MDXComponents } from 'mdx/types';
import { ApiSignature } from './ApiSignature';
import { Callout } from './Callout';
import { Card, CardGrid } from './CardGrid';
import { CodeBlock } from './CodeBlock';
import { CodeTabs } from './CodeTabs';
import { Heading } from './Heading';
import { PropTable } from './PropTable';
import { SmartLink } from './SmartLink';
import { Table } from './Table';
import { LiveDemo } from '../demo/LiveDemo';
import { OptionsLab } from '../demo/OptionsLab';
import { SampleExplorer } from '../demo/SampleExplorer';
import { MediaGallery } from './MediaGallery';

/**
 * Components available inside every MDX page, without importing anything.
 * Fenced code blocks are highlighted by Shiki at build time and only wrapped
 * here (in `CodeBlock`) to add the frame, filename chip and copy button.
 */
export const mdxComponents: MDXComponents = {
    h2: (props) => <Heading level={2} {...props} />,
    h3: (props) => <Heading level={3} {...props} />,
    h4: (props) => <Heading level={4} {...props} />,
    a: (props) => <SmartLink {...props} />,
    pre: (props) => <CodeBlock {...props} />,
    table: Table,
    Callout,
    PropTable,
    ApiSignature,
    Card,
    CardGrid,
    CodeBlock,
    CodeTabs,
    LiveDemo,
    OptionsLab,
    SampleExplorer,
    MediaGallery,
};
