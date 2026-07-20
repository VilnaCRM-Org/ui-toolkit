import { createEvent, fireEvent, render, screen } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import React from 'react';

import UiFileUploadInput from '../../src/components/ui-file-upload-input';
import { matchesAccept } from '../../src/components/ui-file-upload-input/accept-matcher';
import { buildUploadAnnouncement } from '../../src/components/ui-file-upload-input/announce';
import { buildFileUploadModel } from '../../src/components/ui-file-upload-input/field-model';
import { formatBytes } from '../../src/components/ui-file-upload-input/format-bytes';
import { mergeRootSx } from '../../src/components/ui-file-upload-input/styles';
import type { UiFileUploadInputProps } from '../../src/components/ui-file-upload-input/types';
import { validateFiles } from '../../src/components/ui-file-upload-input/validate-files';

import mockConsoleWarn from './utils/mock-console-warn';

// The suite renders deliberately minimal fields in a few specs; silence the
// dev-only accessible-name guidance so it does not clutter the output.
mockConsoleWarn();

const LABEL: string = 'Project logo';
const HINT: string = 'PNG or JPG, up to 2 MB.';
const ACCEPT: string = '.png,.jpg';

function makeFile(name: string, type: string, size: number = 4): File {
  return new File(['x'.repeat(size)], name, { type });
}

const PNG: File = makeFile('logo.png', 'image/png');

/**
 * Picks files the way the OS dialog does. `user.upload` filters by the `accept`
 * attribute and would silently discard the files the validation specs are
 * about — but `accept` only advises the dialog, so a real selection can still
 * arrive unfiltered (and a drop always does).
 */
function pickFiles(files: File[]): void {
  const input: HTMLInputElement = fileInput();
  Object.defineProperty(input, 'files', { value: files, configurable: true });
  fireEvent.change(input);
}

/** The native input — reached through its accessible name, not a test hook. */
function fileInput(): HTMLInputElement {
  return screen.getByLabelText(/choose file/i);
}

function renderField(props: Partial<UiFileUploadInputProps> = {}): void {
  const label: string | undefined = 'label' in props ? props.label : LABEL;

  render(
    <UiFileUploadInput
      label={label}
      aria-label={props['aria-label']}
      files={props.files}
      onFilesChange={props.onFilesChange}
      onValidationError={props.onValidationError}
      accept={props.accept}
      maxSizeBytes={props.maxSizeBytes}
      multiple={props.multiple}
      status={props.status}
      progress={props.progress}
      error={props.error}
      helperText={props.helperText}
      placeholder={props.placeholder}
      buttonLabel={props.buttonLabel}
      disabled={props.disabled}
      required={props.required}
      id={props.id}
    />
  );
}

describe('UiFileUploadInput — rendering and accessible wiring', () => {
  it('renders the visible label, the placeholder and the picker pill', () => {
    renderField();

    expect(screen.getByText(LABEL)).toBeInTheDocument();
    expect(screen.getByText('No file selected')).toBeInTheDocument();
    expect(screen.getByText('Choose file')).toBeInTheDocument();
  });

  it('names the input from the visible label plus the pill text', () => {
    renderField();

    expect(screen.getByLabelText(`${LABEL} Choose file`)).toBe(fileInput());
  });

  it('falls back to aria-label when there is no visible label', () => {
    renderField({ label: undefined, 'aria-label': 'Avatar' });

    expect(fileInput()).toHaveAttribute('aria-label', 'Avatar');
    expect(fileInput()).not.toHaveAttribute('aria-labelledby');
    expect(screen.queryByText(LABEL)).not.toBeInTheDocument();
  });

  it('treats a blank label as absent so the aria-label still names the field', () => {
    renderField({ label: '   ', 'aria-label': 'Avatar' });

    expect(fileInput()).toHaveAttribute('aria-label', 'Avatar');
  });

  it('links the helper text to the input with aria-describedby', () => {
    renderField({ helperText: HINT, id: 'logo' });

    expect(screen.getByText(HINT)).toHaveAttribute('id', 'logo-message');
    expect(fileInput()).toHaveAttribute('aria-describedby', 'logo-message');
  });

  it('omits aria-describedby when there is no message to point at', () => {
    renderField();

    expect(fileInput()).not.toHaveAttribute('aria-describedby');
  });

  it('seeds the element ids from a caller-supplied id', () => {
    renderField({ id: 'logo' });

    expect(fileInput()).toHaveAttribute('id', 'logo-input');
    expect(screen.getByText(LABEL)).toHaveAttribute('id', 'logo-label');
  });

  it('shows the selected file names instead of the placeholder', () => {
    renderField({ files: [PNG, makeFile('spec.png', 'image/png')] });

    expect(screen.getByText('logo.png, spec.png')).toBeInTheDocument();
    expect(screen.queryByText('No file selected')).not.toBeInTheDocument();
  });

  it('honours custom placeholder and button text', () => {
    renderField({ placeholder: 'Nothing yet', buttonLabel: 'Browse' });

    expect(screen.getByText('Nothing yet')).toBeInTheDocument();
    expect(screen.getByText('Browse')).toBeInTheDocument();
  });

  it('forwards accept, multiple, required and disabled to the native input', () => {
    renderField({ accept: ACCEPT, multiple: true, required: true, disabled: true });

    const input: HTMLInputElement = fileInput();
    expect(input).toHaveAttribute('type', 'file');
    expect(input).toHaveAttribute('accept', ACCEPT);
    expect(input).toBeDisabled();
    expect(input.multiple).toBe(true);
    // Advertised to assistive tech, but NOT natively required: the control clears
    // the input's value after every pick, which would pin a native `required`
    // input at `:invalid` and block form submission forever.
    expect(input).toHaveAttribute('aria-required', 'true');
    expect(input).not.toHaveAttribute('required');
    expect(input).toBeRequired();
  });

  it('leaves the input enabled and unmarked by default', () => {
    renderField();

    const input: HTMLInputElement = fileInput();
    expect(input).toBeEnabled();
    expect(input).not.toBeRequired();
    expect(input).not.toHaveAttribute('aria-required');
    expect(input.multiple).toBe(false);
    expect(input).not.toHaveAttribute('aria-invalid');
  });

  it('exposes its display name', () => {
    expect(UiFileUploadInput.displayName).toBe('UiFileUploadInput');
  });

  it('omits both the message element and aria-describedby when there is nothing to say', () => {
    renderField({ id: 'logo' });

    expect(fileInput()).not.toHaveAttribute('aria-describedby');
    // eslint-disable-next-line testing-library/no-node-access -- an absent element has no text to query
    expect(document.getElementById('logo-message')).toBeNull();
  });

  it('is reachable and operable from the keyboard', async () => {
    const user: UserEvent = userEvent.setup();
    renderField();

    await user.tab();
    expect(fileInput()).toHaveFocus();
  });
});

describe('UiFileUploadInput — selection', () => {
  it('publishes a picked file through onFilesChange', async () => {
    const user: UserEvent = userEvent.setup();
    const onFilesChange: jest.Mock = jest.fn();
    renderField({ onFilesChange });

    await user.upload(fileInput(), PNG);

    expect(onFilesChange).toHaveBeenCalledTimes(1);
    expect(onFilesChange).toHaveBeenCalledWith([PNG]);
  });

  it('clears the native value so the same file can be picked again', async () => {
    const user: UserEvent = userEvent.setup();
    const onFilesChange: jest.Mock = jest.fn();
    renderField({ onFilesChange });

    await user.upload(fileInput(), PNG);

    // A repeat pick of an identical path fires no `change` event unless the
    // value was reset, which would strand a user retrying a failed upload.
    expect(fileInput().value).toBe('');
  });

  it('publishes an empty selection when the picker yields no files', () => {
    const onFilesChange: jest.Mock = jest.fn();
    renderField({ onFilesChange });

    // A dismissed OS dialog can leave `files` null rather than an empty list.
    const input: HTMLInputElement = fileInput();
    Object.defineProperty(input, 'files', { value: null, configurable: true });
    fireEvent.change(input);

    expect(onFilesChange).toHaveBeenCalledWith([]);
  });

  it('publishes every file of a multiple selection', async () => {
    const user: UserEvent = userEvent.setup();
    const onFilesChange: jest.Mock = jest.fn();
    const second: File = makeFile('spec.png', 'image/png');
    renderField({ multiple: true, onFilesChange });

    await user.upload(fileInput(), [PNG, second]);

    expect(onFilesChange).toHaveBeenCalledWith([PNG, second]);
  });
});

describe('UiFileUploadInput — validation', () => {
  it('rejects a file whose type is not accepted and explains why', async () => {
    const user: UserEvent = userEvent.setup();
    const onFilesChange: jest.Mock = jest.fn();
    const onValidationError: jest.Mock = jest.fn();
    renderField({ accept: ACCEPT, onFilesChange, onValidationError });

    pickFiles([makeFile('notes.pdf', 'application/pdf')]);

    const message: string = '"notes.pdf" is not an accepted file type. Accepted types: .png,.jpg.';
    expect(onFilesChange).not.toHaveBeenCalled();
    expect(onValidationError).toHaveBeenCalledWith(message);
    // Once as the field's message, once in the live region that announces it.
    expect(screen.getAllByText(message)).toHaveLength(2);
    expect(fileInput()).toHaveAttribute('aria-invalid', 'true');
  });

  it('rejects a file over the size limit and quotes the limit', async () => {
    const user: UserEvent = userEvent.setup();
    const onFilesChange: jest.Mock = jest.fn();
    renderField({ maxSizeBytes: 10, onFilesChange });

    pickFiles([makeFile('big.png', 'image/png', 40)]);

    expect(onFilesChange).not.toHaveBeenCalled();
    expect(screen.getAllByText('"big.png" is larger than the 10 B limit.')).toHaveLength(2);
  });

  it('replaces the helper text with the rejection reason, then restores it', async () => {
    const user: UserEvent = userEvent.setup();
    renderField({ accept: ACCEPT, helperText: HINT });

    expect(screen.getByText(HINT)).toBeInTheDocument();
    pickFiles([makeFile('notes.pdf', 'application/pdf')]);
    expect(screen.queryByText(HINT)).not.toBeInTheDocument();

    pickFiles([PNG]);
    expect(screen.getByText(HINT)).toBeInTheDocument();
  });

  it('accepts a file matching a wildcard media type', async () => {
    const user: UserEvent = userEvent.setup();
    const onFilesChange: jest.Mock = jest.fn();
    renderField({ accept: 'image/*', onFilesChange });

    await user.upload(fileInput(), PNG);

    expect(onFilesChange).toHaveBeenCalledWith([PNG]);
  });
});

describe('UiFileUploadInput — drag and drop', () => {
  function dropFiles(files: File[]): void {
    fireEvent.drop(fileInput(), { dataTransfer: { files } });
  }

  it('accepts a dropped file through the same path as the picker', () => {
    const onFilesChange: jest.Mock = jest.fn();
    renderField({ onFilesChange });

    dropFiles([PNG]);

    expect(onFilesChange).toHaveBeenCalledWith([PNG]);
  });

  it('validates dropped files, which bypass the native accept filter', () => {
    const onFilesChange: jest.Mock = jest.fn();
    const onValidationError: jest.Mock = jest.fn();
    renderField({ accept: ACCEPT, onFilesChange, onValidationError });

    dropFiles([makeFile('notes.pdf', 'application/pdf')]);

    expect(onFilesChange).not.toHaveBeenCalled();
    expect(onValidationError).toHaveBeenCalled();
  });

  it('cancels the drag default so the browser does not navigate to the file', () => {
    renderField();

    const dragOver: boolean = fireEvent.dragOver(fileInput(), { dataTransfer: { files: [] } });
    const drop: boolean = fireEvent.drop(fileInput(), { dataTransfer: { files: [] } });

    // fireEvent returns false once a handler has called preventDefault.
    expect(dragOver).toBe(false);
    expect(drop).toBe(false);
  });

  it('highlights the field while a drag is over it and clears it on leave', () => {
    renderField({ id: 'logo' });

    // eslint-disable-next-line testing-library/no-node-access -- styled surface, no role
    const surface: HTMLElement = document.getElementById('logo-dropzone') as HTMLElement;
    const resting: string = surface.className;

    fireEvent.dragEnter(fileInput(), { dataTransfer: { files: [] } });
    expect(surface.className).not.toBe(resting);

    fireEvent.dragLeave(fileInput());
    expect(surface.className).toBe(resting);
  });

  it('keeps the highlight while the drag moves onto a child of the field', () => {
    renderField({ id: 'logo' });

    // eslint-disable-next-line testing-library/no-node-access -- styled surface, no role
    const surface: HTMLElement = document.getElementById('logo-dropzone') as HTMLElement;
    const resting: string = surface.className;

    fireEvent.dragEnter(fileInput(), { dataTransfer: { files: [] } });
    const dragging: string = surface.className;
    const leave: Event = createEvent.dragLeave(fileInput());
    // jsdom has no DragEvent, so fireEvent's init drops `relatedTarget`.
    Object.defineProperty(leave, 'relatedTarget', { value: fileInput() });
    fireEvent(fileInput(), leave);

    expect(surface.className).toBe(dragging);
    expect(dragging).not.toBe(resting);
  });

  it('leaves the selection alone when a drag carries no files', () => {
    const onFilesChange: jest.Mock = jest.fn();
    renderField({ files: [PNG], onFilesChange });

    // Dropping selected text or a link still fires `drop` with an empty list;
    // treating that as "cleared" would destroy the user's selection silently.
    dropFiles([]);

    expect(onFilesChange).not.toHaveBeenCalled();
    expect(screen.getByText('logo.png')).toBeInTheDocument();
  });

  it('rejects a multi-file drop on a single-file field', () => {
    const onFilesChange: jest.Mock = jest.fn();
    renderField({ onFilesChange });

    dropFiles([PNG, makeFile('spec.png', 'image/png')]);

    expect(onFilesChange).not.toHaveBeenCalled();
    expect(screen.getAllByText('Only one file can be selected at a time.')).toHaveLength(2);
  });

  it('accepts a multi-file drop once multiple is allowed', () => {
    const onFilesChange: jest.Mock = jest.fn();
    const second: File = makeFile('spec.png', 'image/png');
    renderField({ multiple: true, onFilesChange });

    dropFiles([PNG, second]);

    expect(onFilesChange).toHaveBeenCalledWith([PNG, second]);
  });

  it('ignores drags and drops while disabled', () => {
    const onFilesChange: jest.Mock = jest.fn();
    renderField({ disabled: true, onFilesChange, id: 'logo' });

    // eslint-disable-next-line testing-library/no-node-access -- styled surface, no role
    const surface: HTMLElement = document.getElementById('logo-dropzone') as HTMLElement;
    const resting: string = surface.className;

    fireEvent.dragOver(fileInput(), { dataTransfer: { files: [] } });
    expect(surface.className).toBe(resting);

    fireEvent.drop(fileInput(), { dataTransfer: { files: [PNG] } });
    expect(onFilesChange).not.toHaveBeenCalled();
  });
});

describe('UiFileUploadInput — surface states', () => {
  function surfaceClass(id: string): string {
    // eslint-disable-next-line testing-library/no-node-access -- styled surface, no role
    return (document.getElementById(`${id}-dropzone`) as HTMLElement).className;
  }

  it('paints the disabled and invalid surfaces differently from the resting one', () => {
    render(<UiFileUploadInput label={LABEL} id="rest" />);
    render(<UiFileUploadInput label={LABEL} id="off" disabled />);
    render(<UiFileUploadInput label={LABEL} id="bad" error helperText="Required." />);

    expect(surfaceClass('off')).not.toBe(surfaceClass('rest'));
    expect(surfaceClass('bad')).not.toBe(surfaceClass('rest'));
    expect(surfaceClass('bad')).not.toBe(surfaceClass('off'));
  });
});

describe('UiFileUploadInput — upload lifecycle', () => {
  it('shows no progress bar or status pill while idle', () => {
    renderField({ files: [PNG] });

    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    expect(screen.queryByText('Uploading')).not.toBeInTheDocument();
  });

  it('renders no status pill element at all while idle', () => {
    renderField({ files: [PNG] });

    // eslint-disable-next-line testing-library/no-node-access -- styled pill, no role
    expect(document.querySelector('.ui-file-upload-dot')).toBeNull();
  });

  it('renders the status pill element once an upload has started', () => {
    renderField({ files: [PNG], status: 'uploading' });

    // eslint-disable-next-line testing-library/no-node-access -- styled pill, no role
    expect(document.querySelector('.ui-file-upload-dot')).not.toBeNull();
  });

  it('reports progress on a determinate bar while uploading', () => {
    renderField({ files: [PNG], status: 'uploading', progress: 45 });

    const bar: HTMLElement = screen.getByRole('progressbar');
    expect(bar).toHaveAttribute('aria-valuenow', '45');
    expect(bar).toHaveAccessibleName('Upload progress');
    expect(screen.getByText('Uploading')).toBeInTheDocument();
  });

  it('renders an empty bar when the app reports no percentage', () => {
    renderField({ files: [PNG], status: 'uploading' });

    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');
  });

  it('clamps an out-of-range percentage into 0–100', () => {
    const { rerender } = render(
      <UiFileUploadInput label={LABEL} files={[PNG]} status="uploading" progress={140} />
    );
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100');

    rerender(<UiFileUploadInput label={LABEL} files={[PNG]} status="uploading" progress={-20} />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');
  });

  it('treats a non-finite percentage as no progress rather than a full bar', () => {
    // `loaded / total * 100` is NaN when a response has no Content-Length.
    renderField({ files: [PNG], status: 'uploading', progress: Number.NaN });

    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');
  });

  it('reports success as text, not colour alone', () => {
    renderField({ files: [PNG], status: 'success' });

    expect(screen.getByText('Uploaded')).toBeInTheDocument();
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    expect(fileInput()).not.toHaveAttribute('aria-invalid');
  });

  it('marks the field invalid when the upload fails', () => {
    renderField({ files: [PNG], status: 'error', helperText: 'Server rejected the file.' });

    expect(screen.getByText('Upload failed')).toBeInTheDocument();
    expect(screen.getByText('Server rejected the file.')).toBeInTheDocument();
    expect(fileInput()).toHaveAttribute('aria-invalid', 'true');
  });

  it('marks the field invalid on an explicit error prop', () => {
    renderField({ error: true, helperText: 'Required.' });

    expect(fileInput()).toHaveAttribute('aria-invalid', 'true');
  });
});

describe('UiFileUploadInput — assistive-technology announcements', () => {
  function status(): HTMLElement {
    return screen.getByRole('status');
  }

  it('starts by reporting that nothing is selected', () => {
    renderField();

    expect(status()).toHaveTextContent('No file selected.');
  });

  it('announces a single selection by name', () => {
    renderField({ files: [PNG] });

    expect(status()).toHaveTextContent('logo.png selected.');
  });

  it('announces a multiple selection by count', () => {
    renderField({ files: [PNG, makeFile('spec.png', 'image/png')] });

    expect(status()).toHaveTextContent('2 files selected.');
  });

  it('announces the upload outcome alongside the selection', () => {
    renderField({ files: [PNG], status: 'success' });

    expect(status()).toHaveTextContent('logo.png selected. Upload complete.');
  });

  it('announces an in-flight upload without narrating percentages', () => {
    renderField({ files: [PNG], status: 'uploading', progress: 45 });

    expect(status()).toHaveTextContent('logo.png selected. Upload in progress.');
    expect(status()).not.toHaveTextContent('45');
  });

  it('announces a failed upload', () => {
    renderField({ files: [PNG], status: 'error', helperText: 'Server rejected the file.' });

    expect(status()).toHaveTextContent('logo.png selected. Upload failed.');
  });

  it('announces the rejection reason instead of a selection that did not happen', async () => {
    const user: UserEvent = userEvent.setup();
    renderField({ accept: ACCEPT });

    pickFiles([makeFile('notes.pdf', 'application/pdf')]);

    expect(status()).toHaveTextContent('"notes.pdf" is not an accepted file type');
    expect(status()).not.toHaveTextContent('selected.');
  });
});

describe('UiFileUploadInput — repeated rejection', () => {
  it('re-announces an identical rejection so a retry is not silent', () => {
    renderField({ accept: ACCEPT });
    const before: HTMLElement = screen.getByRole('status');

    pickFiles([makeFile('notes.pdf', 'application/pdf')]);
    const first: HTMLElement = screen.getByRole('status');
    pickFiles([makeFile('notes.pdf', 'application/pdf')]);
    const second: HTMLElement = screen.getByRole('status');

    // Identical text in a live region is not a change an assistive technology
    // can detect, so the region is remounted to give the retry a fresh identity.
    expect(first).not.toBe(before);
    expect(second).not.toBe(first);
    expect(second).toHaveTextContent('is not an accepted file type');
  });
});

describe('formatBytes', () => {
  it.each([
    [0, '0 B'],
    [512, '512 B'],
    [1024, '1 KB'],
    [1536, '1.5 KB'],
    [2 * 1024 * 1024, '2 MB'],
    [3 * 1024 * 1024 * 1024, '3 GB'],
    [5 * 1024 ** 4, '5 TB'],
    [5 * 1024 ** 5, '5120 TB'],
  ])('renders %d bytes as %s', (bytes: number, expected: string) => {
    expect(formatBytes(bytes)).toBe(expected);
  });
});

describe('matchesAccept', () => {
  it('accepts everything when the list is empty', () => {
    expect(matchesAccept(PNG, '')).toBe(true);
    expect(matchesAccept(PNG, ' , ')).toBe(true);
  });

  it('matches an extension token case-insensitively', () => {
    expect(matchesAccept(makeFile('LOGO.PNG', ''), '.png')).toBe(true);
    expect(matchesAccept(makeFile('logo.gif', ''), '.png')).toBe(false);
  });

  it('matches a wildcard media type', () => {
    expect(matchesAccept(makeFile('logo.png', 'image/png'), 'image/*')).toBe(true);
    expect(matchesAccept(makeFile('notes.pdf', 'application/pdf'), 'image/*')).toBe(false);
  });

  it('matches an exact media type', () => {
    expect(matchesAccept(makeFile('logo.png', 'image/png'), 'image/png')).toBe(true);
    expect(matchesAccept(makeFile('logo.gif', 'image/gif'), 'image/png')).toBe(false);
  });

  it('accepts a file matching any token of a list', () => {
    expect(matchesAccept(makeFile('logo.jpg', ''), '.png, .jpg')).toBe(true);
  });
});

describe('validateFiles', () => {
  it('passes a selection with no constraints', () => {
    expect(validateFiles([PNG], {})).toEqual({ accepted: [PNG], error: null });
  });

  it('rejects the whole batch when one file offends', () => {
    const bad: File = makeFile('notes.pdf', 'application/pdf');

    const result: ReturnType<typeof validateFiles> = validateFiles([PNG, bad], {
      accept: '.png',
      multiple: true,
    });

    expect(result.accepted).toEqual([]);
    expect(result.error).toContain('notes.pdf');
  });

  it('reports the first offender when several are invalid', () => {
    const first: File = makeFile('a.pdf', 'application/pdf');
    const second: File = makeFile('b.pdf', 'application/pdf');

    expect(validateFiles([first, second], { accept: '.png', multiple: true }).error).toContain(
      'a.pdf'
    );
  });

  it('accepts a file exactly on the size limit', () => {
    const file: File = makeFile('logo.png', 'image/png', 10);

    expect(validateFiles([file], { maxSizeBytes: 10 }).error).toBeNull();
  });

  it('rejects more than one file unless multiple is allowed', () => {
    const second: File = makeFile('spec.png', 'image/png');

    expect(validateFiles([PNG, second], {}).error).toBe('Only one file can be selected at a time.');
    expect(validateFiles([PNG, second], { multiple: true }).error).toBeNull();
    expect(validateFiles([PNG], {}).error).toBeNull();
  });

  it('passes an empty selection', () => {
    expect(validateFiles([], { accept: '.png' })).toEqual({ accepted: [], error: null });
  });
});

describe('buildUploadAnnouncement', () => {
  it('returns the validation error verbatim when there is one', () => {
    expect(buildUploadAnnouncement('idle', ['a.png'], 'nope')).toBe('nope');
  });

  it('omits the status clause while idle', () => {
    expect(buildUploadAnnouncement('idle', ['a.png'], null)).toBe('a.png selected.');
  });
});

describe('buildFileUploadModel', () => {
  it('defaults to no files when the prop is omitted', () => {
    const model: ReturnType<typeof buildFileUploadModel> = buildFileUploadModel({}, null);

    expect(model.fileNames).toEqual([]);
    expect(model.displayText).toBe('No file selected');
    expect(model.invalid).toBe(false);
    expect(model.message).toBeUndefined();
  });

  it('lets a validation error outrank the helper text', () => {
    const model: ReturnType<typeof buildFileUploadModel> = buildFileUploadModel(
      { helperText: HINT },
      'rejected'
    );

    expect(model.message).toBe('rejected');
    expect(model.invalid).toBe(true);
  });
});

describe('mergeRootSx', () => {
  // The field is fluid by default; a consumer's sx is layered on top of that
  // rather than replacing it, so constraining the width cannot accidentally
  // reinstate the shrink-wrapping the fluid root exists to prevent.
  const root: Record<string, string> = { width: '100%' };

  it('keeps the fluid root when the consumer passes nothing', () => {
    expect(mergeRootSx(undefined)).toEqual([root, {}]);
  });

  it('layers an object sx on top of the root', () => {
    expect(mergeRootSx({ maxWidth: '10rem' })).toEqual([root, { maxWidth: '10rem' }]);
  });

  it('flattens an array sx on top of the root', () => {
    expect(mergeRootSx([{ maxWidth: '10rem' }, { margin: 1 }])).toEqual([
      root,
      { maxWidth: '10rem' },
      { margin: 1 },
    ]);
  });
});
