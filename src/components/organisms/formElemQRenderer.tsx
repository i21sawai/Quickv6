import { useMemo, useState } from 'react';
import { Label } from '@radix-ui/react-dropdown-menu';

import { Element } from '@/types/element';
import { cn } from '@/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { Input } from '../ui/input';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Textarea } from '../ui/textarea';

export const FormElemQRenderer = ({
  _element,
  _setElement,
}: {
  _element: Element;
  _setElement: (e: Element) => void;
}) => {
  const [element, setElement] = useState(() => {
    // Initialize with empty answers if in exam mode (not readonly)
    if (!_element.readonly && _element.answers.length === 0) {
      return _element;
    }
    return _element;
  });

  switch (element.type) {
    case 'text':
      return (
        <div className="flex flex-col gap-4">
          <Input
            value={(element.answers[0] as string) || ''}
            onChange={(e) => {
              setElement({ ...element, answers: [e.target.value] });
              _setElement({ ...element, answers: [e.target.value] });
            }}
            disabled={element.readonly}
          />
          {element.trueAnswers && (
            <div className="flex flex-col gap-4">
              <Label className="font-bold text-green-500">模範解答</Label>
              {element.trueAnswers.map((ans, i) => (
                <p key={i} className="text-muted-foreground">
                  {ans}
                </p>
              ))}
            </div>
          )}
        </div>
      );
    case 'paragraph':
      return (
        <div className="flex flex-col gap-4">
          <Textarea
            value={(element.answers[0] as string) || ''}
            onChange={(e) => {
              setElement({ ...element, answers: [e.target.value] });
              _setElement({ ...element, answers: [e.target.value] });
            }}
            disabled={element.readonly}
          />
          {element.trueAnswers && (
            <div className="flex flex-col gap-4">
              <Label className="font-bold text-green-500">模範解答</Label>
              {element.trueAnswers.map((ans, i) => (
                <p key={i} className="text-muted-foreground">
                  {ans}
                </p>
              ))}
            </div>
          )}
        </div>
      );
    case 'radio':
      return (
        <RadioGroup
          value={element.answers.length > 0 && element.answers[0] !== -1 ? `${element.answers[0]}` : ''}
          onValueChange={(value) => {
            setElement({ ...element, answers: [parseInt(value)] });
            _setElement({ ...element, answers: [parseInt(value)] });
          }}
          disabled={element.readonly}
          className="flex flex-wrap gap-x-8 gap-y-4"//追加したやつ
        >
          {element.options.map((option, i) => (
            <div key={i + 1} className="flex items-center gap-2">
              <RadioGroupItem
                value={`${i + 1}`}
                className={
                  element.trueAnswers && i + 1 === element.trueAnswers[0]
                    ? 'bg-green-500 border-green-500'
                    : ''
                }
              />
              <Label>{option}</Label>
            </div>
          ))}
        </RadioGroup>
      );
    case 'matrix':
      return (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-20 min-w-20 max-w-20">問題</TableHead>
              {element.options.map((option, i) => (
                <TableHead
                  className={cn(
                    'w-12 min-w-12 max-w-12 text-center md:w-28 md:min-w-28 md:max-w-28'
                  )}
                  key={i}
                >
                  {option}
                </TableHead>
              ))}
              <TableHead className="w-auto"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {element.questions.map((question, i) => (
              <TableRow key={i}>
                <TableCell>{question}</TableCell>
                <TableCell colSpan={element.options.length}>
                  <RadioGroup
                    value={
                      (element.answers as number[][])[i] && 
                      (element.answers as number[][])[i][0] && 
                      (element.answers as number[][])[i][0] !== -1 
                        ? `${(element.answers as number[][])[i][0]}` 
                        : ''
                    }
                    onValueChange={(value: any) => {
                      const _answers = element.answers as number[][];
                      //fill up all element with null or value
                      console.log(_answers);
                      for (let i = 0; i < element.questions.length; i++) {
                        if (!_answers[i]) {
                          _answers[i] = [-1];
                        }
                      }
                      _answers[i] = [parseInt(value)];
                      console.log(_answers);
                      setElement({ ...element, answers: _answers });
                      _setElement({ ...element, answers: _answers });
                    }}
                    className={
                      'flex justify-end gap-[48px] px-3 md:gap-[96px] md:px-8 '
                    }
                    disabled={element.readonly}
                  >
                    {element.options.map((_, j) => (
                      <RadioGroupItem
                        key={j}
                        value={`${j + 1}`}
                        className={
                          element.trueAnswers &&
                          j + 1 === (element.trueAnswers as number[][])[i][0]
                            ? 'bg-green-500 border-green-500'
                            : ''
                        }
                      />
                    ))}
                  </RadioGroup>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      );

    default:
      return null;
  }
};
