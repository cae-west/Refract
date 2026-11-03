import React, {type ReactNode} from 'react';
import Footer from '@theme-original/Footer';
import type FooterType from '@theme/Footer';
import type {WrapperProps} from '@docusaurus/types';
import BrowserOnly from '@docusaurus/BrowserOnly';
import DocsAssistant from '@site/src/components/DocsAssistant';

type Props = WrapperProps<typeof FooterType>;

// The footer renders on every page inside the theme providers (color mode,
// code block theme), so it is the right place to mount the docs assistant.
export default function FooterWrapper(props: Props): ReactNode {
  return (
    <>
      <Footer {...props} />
      <BrowserOnly>{() => <DocsAssistant />}</BrowserOnly>
    </>
  );
}
