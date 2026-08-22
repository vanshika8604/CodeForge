import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CodeEditor } from "./CodeEditor";
import { FakeSocket } from "@/testUtils/fakeSocket";

let capturedOnChange: ((value: string | undefined) => void) | null = null;
let capturedOnMount: ((editor: any) => void) | null = null;
let fakeEditorValue = "";

jest.mock("@monaco-editor/react", () => ({
  __esModule: true,
  default: (props: any) => {
    capturedOnChange = props.onChange;
    capturedOnMount = props.onMount;
    return (
      <textarea
        data-testid="fake-monaco"
        defaultValue={props.defaultValue}
        onChange={(e) => props.onChange(e.target.value)}
      />
    );
  },
}));

function buildFakeMonacoEditorInstance() {
  return {
    getValue: () => fakeEditorValue,
    setValue: (v: string) => {
      fakeEditorValue = v;
      capturedOnChange?.(v);
    },
  };
}

describe("CodeEditor", () => {
  let fakeSocket: FakeSocket;

  beforeEach(() => {
    fakeSocket = new FakeSocket();
    fakeEditorValue = "";
    capturedOnChange = null;
    capturedOnMount = null;
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("emits code:change (debounced) when the user types", () => {
    render(
      <CodeEditor
        roomId="room-1"
        socketRef={{ current: fakeSocket as any }}
        initialCode=""
        language="javascript"
      />
    );

    const editor = buildFakeMonacoEditorInstance();
    capturedOnMount!(editor);

    capturedOnChange!("console.log(1)");

    expect(fakeSocket.emitted).toHaveLength(0); // debounced, not yet fired

    jest.advanceTimersByTime(300);

    const changeCall = fakeSocket.emitted.find((e) => e.event === "code:change");
    expect(changeCall?.args[0]).toEqual({ roomId: "room-1", content: "console.log(1)" });
  });

  it("applies an incoming code:update without re-emitting code:change (no feedback loop)", () => {
    render(
      <CodeEditor
        roomId="room-1"
        socketRef={{ current: fakeSocket as any }}
        initialCode=""
        language="javascript"
      />
    );

    const editor = buildFakeMonacoEditorInstance();
    capturedOnMount!(editor);

    fakeSocket.__trigger("code:update", { content: "let x = from_remote;" });

    jest.advanceTimersByTime(500);

    const changeCall = fakeSocket.emitted.find((e) => e.event === "code:change");
    expect(changeCall).toBeUndefined();
    expect(fakeEditorValue).toBe("let x = from_remote;");
  });
});