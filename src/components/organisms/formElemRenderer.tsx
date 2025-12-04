import { Plate } from '@udecode/plate-common';

import { Element } from '@/types/element';
import { plugins } from '@/lib/plate/plate-plugins';

import { Editor } from '../plate-ui/editor';
import { Badge } from '../ui/badge';
import { FormElemQRenderer } from './formElemQRenderer';

export const FormElemRenderer = ({
  count,
  elem,
  setElem,
}: {
  count: number;
  elem: Element;
  setElem: (e: Element) => void;
}) => {
  return (
    <div className="flex flex-col">
      <div className="mb-4 flex">
        <div className="flex w-full flex-col gap-2">
          <h2 className="w-full scroll-m-20 border-b pb-2 text-xl font-semibold tracking-tight first:mt-0">
            {elem.title}
          </h2>
          {elem.tags.length >= 1 && (
            <div className="flex gap-2">
              {elem?.tags.map((tag, i) => (
                <Badge key={i} variant={'secondary'}>
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>

        <div className="w-16 text-sm text-muted-foreground">
          {elem?.point}点
        </div>
      </div>
      {elem && (
        <div>
          {elem.telems.length >= 1 && (
            <Plate plugins={plugins} value={elem.telems} readOnly key={count}>
              <Editor className="border-none p-0" readOnly />
            </Plate>
          )}

          <FormElemQRenderer _element={elem as Element} _setElement={setElem} />
        </div>
      )}
    </div>
  );
};
