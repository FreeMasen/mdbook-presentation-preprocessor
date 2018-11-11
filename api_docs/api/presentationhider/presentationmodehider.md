# Table of contents

* [PresentationModeHider][ClassDeclaration-0]
    * Constructor
        * [constructor()][Constructor-0]
    * Methods
        * [getMode()][MethodDeclaration-0]
        * [setMode()][MethodDeclaration-1]
        * [updatePage()][MethodDeclaration-2]
        * [updateElements(elements)][MethodDeclaration-3]
        * [swapClass(add, remove, old)][MethodDeclaration-4]
        * [toggle()][MethodDeclaration-5]
    * Properties
        * [mode][PropertyDeclaration-0]
        * [queryKey][PropertyDeclaration-1]

# PresentationModeHider

The object that will handle all of the
presentation mode activities

```typescript
class PresentationModeHider
```
## Constructor

### constructor()

```typescript
public constructor();
```

## Methods

### getMode()

Get the current presentation mode from storage

```typescript
private getMode(): PresentationMode;
```

**Return type**

[PresentationMode][EnumDeclaration-0]

----------

### setMode()

Update the storage to have the same value as `this.mode`

```typescript
private setMode(): void;
```

**Return type**

void

----------

### updatePage()

Find all of the `.presentation-only` and `.article-content` items
and update them to have either a `presenting` or `not-presenting` class

```typescript
private updatePage(): void;
```

**Return type**

void

----------

### updateElements(elements)

Update a list of `HTMLDivElement`s to have either the `presenting`
or `not-presenting` class

```typescript
private updateElements(elements: NodeListOf<HTMLDivElement>): void;
```

**Parameters**

| Name     | Type                       | Description                               |
| -------- | -------------------------- | ----------------------------------------- |
| elements | NodeListOf<HTMLDivElement> | A list of `HTMLDivElement`s to be updated |

**Return type**

void

----------

### swapClass(add, remove, old)

Add one class and remove another to a class list

```typescript
private swapClass(add: string, remove: string, old: string): string;
```

**Parameters**

| Name   | Type   | Description             |
| ------ | ------ | ----------------------- |
| add    | string | The new class to add    |
| remove | string | The old class to remove |
| old    | string | The current class list  |

**Return type**

string

----------

### toggle()

Toggle betwen`Web` and `Slides` presentation mode

```typescript
private toggle(): void;
```

**Return type**

void

## Properties

### mode

The current mode

```typescript
private mode: PresentationMode;
```

**Type**

[PresentationMode][EnumDeclaration-0]

----------

### queryKey

A constant value for the localStorage
Key

```typescript
private queryKey: string;
```

**Type**

string

[ClassDeclaration-0]: presentationmodehider.md#presentationmodehider
[Constructor-0]: presentationmodehider.md#constructor
[MethodDeclaration-0]: presentationmodehider.md#getmode
[EnumDeclaration-0]: ../presentationHider.md#presentationmode
[MethodDeclaration-1]: presentationmodehider.md#setmode
[MethodDeclaration-2]: presentationmodehider.md#updatepage
[MethodDeclaration-3]: presentationmodehider.md#updateelementselements
[MethodDeclaration-4]: presentationmodehider.md#swapclassadd-remove-old
[MethodDeclaration-5]: presentationmodehider.md#toggle
[PropertyDeclaration-0]: presentationmodehider.md#mode
[EnumDeclaration-0]: ../presentationHider.md#presentationmode
[PropertyDeclaration-1]: presentationmodehider.md#querykey