import { CircleAlertIcon, FileTextIcon, InfoIcon } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

const SAMPLES = [
  { label: "짧은 글 예시", url: "https://stephango.com/saw" },
  { label: "긴 글 예시", url: "https://ko.wikipedia.org/wiki/마크다운" },
];

export function StartEmpty({ onSample }: { onSample: (url: string) => void }) {
  return (
    <Empty className="border p-10">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <FileTextIcon />
        </EmptyMedia>
        <EmptyTitle>아직 변환한 페이지가 없습니다</EmptyTitle>
        <EmptyDescription>
          블로그 글, 뉴스 기사, 문서 페이지처럼 본문이 있는 주소를 붙여넣어
          보세요.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent className="flex-row flex-wrap justify-center">
        {SAMPLES.map((sample) => (
          <Button
            key={sample.url}
            variant="outline"
            size="sm"
            onClick={() => onSample(sample.url)}
          >
            {sample.label}
          </Button>
        ))}
      </EmptyContent>
    </Empty>
  );
}

export function LoadingCard() {
  return (
    <Card aria-busy="true" aria-label="변환 중" className="gap-0 py-0">
      <div className="flex flex-col gap-2.5 p-5">
        <Skeleton className="h-5.5 w-[70%]" />
        <Skeleton className="h-3.5 w-[40%]" />
      </div>
      <Separator />
      <div className="flex flex-col gap-2.5 p-5">
        <Skeleton className="h-3.5 w-full" />
        <Skeleton className="h-3.5 w-[94%]" />
        <Skeleton className="h-3.5 w-[97%]" />
        <Skeleton className="h-3.5 w-[62%]" />
      </div>
    </Card>
  );
}

export function FetchFailedAlert({
  httpStatus,
  onRetry,
}: {
  httpStatus?: number;
  onRetry: () => void;
}) {
  return (
    <Alert variant="destructive">
      <CircleAlertIcon />
      <AlertTitle>페이지를 가져오지 못했습니다</AlertTitle>
      <AlertDescription>
        사이트가 응답하지 않거나 접근을 막고 있습니다
        {httpStatus ? `(응답 ${httpStatus})` : ""}. 주소가 맞는지 확인하고 다시
        시도해 주세요.
        <div className="mt-2">
          <Button variant="outline" className="text-foreground" onClick={onRetry}>
            다시 시도
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}

export function EmptyBodyAlert() {
  return (
    <Alert>
      <InfoIcon />
      <AlertTitle>추출할 본문을 찾지 못했습니다</AlertTitle>
      <AlertDescription>
        로그인이 필요한 페이지이거나, 글보다 메뉴와 링크가 대부분인 페이지일 수
        있습니다. 글이 있는 개별 페이지 주소로 다시 시도해 보세요.
      </AlertDescription>
    </Alert>
  );
}
