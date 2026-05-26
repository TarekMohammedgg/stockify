"use client";

import { useServerInsertedHTML } from "next/navigation";
import { useRef } from "react";

export default function BypassExtensionHydration() {
  const isInserted = useRef(false);

  useServerInsertedHTML(() => {
    if (isInserted.current) return;
    isInserted.current = true;

    return (
      <script
        id="remove-bis-skin-checked"
        dangerouslySetInnerHTML={{
          __html: `
            (function() {
              const removeAttr = (el) => {
                if (el && el.hasAttribute && el.hasAttribute('bis_skin_checked')) {
                  el.removeAttribute('bis_skin_checked');
                }
              };
              
              const observer = new MutationObserver((mutations) => {
                for (let i = 0; i < mutations.length; i++) {
                  const m = mutations[i];
                  if (m.type === 'attributes' && m.attributeName === 'bis_skin_checked') {
                    removeAttr(m.target);
                  } else if (m.type === 'childList') {
                    for (let j = 0; j < m.addedNodes.length; j++) {
                      const node = m.addedNodes[j];
                      if (node.nodeType === 1) {
                        removeAttr(node);
                        const elements = node.querySelectorAll('[bis_skin_checked]');
                        for (let k = 0; k < elements.length; k++) {
                          removeAttr(elements[k]);
                        }
                      }
                    }
                  }
                }
              });

              observer.observe(document.documentElement, {
                attributes: true,
                childList: true,
                subtree: true,
                attributeFilter: ['bis_skin_checked']
              });
            })();
          `,
        }}
      />
    );
  });

  return null;
}
