export enum TokenType {
    // reserved keyword tokens
    AND = "and",
    BREAK = "break",
    DO = "do",
    ELSE = "else",
    ELSEIF = "elseif",
    END = "end",
    FALSE = "false",
    FOR = "for",
    FUNCTION = "function",
    IF = "if",
    IN = "in",
    LOCAL = "local",
    NIL = "nil",
    NOT = "not",
    OR = "or",
    REPEAT = "repeat",
    RETURN = "return",
    THEN = "then",
    TRUE = "true",
    UNTIL = "until",
    WHILE = "while",

    // reserved other tokens
    ADDITION = "+",
    SUBTRACTION = "-",
    MULTIPLICATION = "*",
    DIVISION = "/",
    MODULO = "%",
    EXPONENTIATION = "^",
    LENGTH = "#",
    EQEQ = "==",
    NEQ = "~=",
    LTEQ = "<=",
    MTEQ = ">=",
    LT = "<",
    MT = ">",
    EQ = "=",
    PO = "(",
    PC = ")",
    BO = "{",
    BC = "}",
    TO = "[",
    TC = "]",
    EOS = ";",
    SDEREF = ":",
    SEP = ",",
    DEREF = ".",
    CONCAT = "..",
    VARARG = "...",

    // control
    EOF = "eof",

    // value
    IDENTIFIER = "identifier",
    STRING = "string",
    NUMBER = "number",
}

export abstract class Token {
    public readonly type: TokenType;
    constructor(type: TokenType) {
        this.type = type;
    }
    public toString(): string {
        return "<" + this.type + ">";
    }
}

export class ReservedToken extends Token {}

export class IdentifierToken extends Token {
    public name: string;
    constructor(name: string) {
        super(TokenType.IDENTIFIER);
        this.name = name;
    }
}

export class StringToken extends Token {
    public value: string;
    constructor(value: string) {
        super(TokenType.STRING);
        this.value = value;
    }
}

export class NumberToken extends Token {
    public value: number;
    constructor(value: number) {
        super(TokenType.NUMBER);
        this.value = value;
    }
}

enum LexerState {
    UNKNOWN,
    NUMBER,
    STRING,
    KEYWORD,
    OTHER,
}

class StringBuffer {
    private readonly buffer: string[];
    private len: number;
    constructor() {
        this.buffer = [];
        this.len = 0;
    }
    length() {
        return this.len;
    }
    read() {
        return this.buffer.join("");
    }
    write(s: string) {
        this.buffer.push(s);
        this.len += s.length;
    }
    clear() {
        this.buffer.length = 0;
    }
}

export default class Lexer {
    constructor() {}
    private isWhiteSpaceChar(c: string): boolean {
        // const wt =  new Set<string>();
        return " \f\n\r\t\v\u00A0\u2028\u2029".includes(c);
    }
    private isControlChar(c: string): boolean {
        return "+-*/%^#=~<>(){}[];:,.".includes(c);
    }
    private isShortControlChar(c: string): boolean {
        return "(){}[];:,".includes(c);
    }
    private isNumberChar(c: string): boolean {
        return "0123456789".includes(c);
    }
    private isStringChar(c: string): boolean {
        return "\"'".includes(c);
    }
    private isKeywordChar(c: string): boolean {
        return /^[a-zA-Z_]$/.test(c);
    }
    private isExtendedKeywordChar(c: string): boolean {
        return /^[a-zA-Z0-9_]$/.test(c);
    }
    private isStringEscapeChar(c: string): boolean {
        return "\\".includes(c);
    }
    private isString(c: string): boolean {
        return /^".*"$/.test(c);
    }
    private isIdentifier(c: string): boolean {
        return /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(c);
    }
    private isNumber(c: string): boolean {
        return /^((0|[1-9][0-9]*)(\.[0-9]*)?)|(\.[0-9]+)$/.test(c);
    }
    public tokenize(text: string): Token[] {
        const tokens: Token[] = [];
        let state = LexerState.UNKNOWN;
        const buffer = new StringBuffer();
        const len = text.length;

        let numberFloating = false;
        let stringEscaped = false;
        let stringQuote: string | undefined = undefined;
        for (let i = 0; i < len + 1; i++) {
            const current = i < len ? text[i] : "\n";
            const next = i + 1 < len ? text[i + 1] : "\n";

            if (state === LexerState.UNKNOWN) {
                if (this.isNumberChar(current) || (current === "." && this.isNumberChar(next))) {
                    state = LexerState.NUMBER;
                    numberFloating = false;
                } else if (this.isStringChar(current)) {
                    state = LexerState.STRING;
                    stringEscaped = false;
                    stringQuote = undefined;
                } else if (this.isKeywordChar(current)) {
                    state = LexerState.KEYWORD;
                } else if (this.isControlChar(current)) {
                    state = LexerState.OTHER;
                }
            }

            if (state === LexerState.NUMBER) {
                if (this.isNumberChar(current)) {
                    buffer.write(current);
                } else if (!numberFloating && current === ".") {
                    buffer.write(current);
                    numberFloating = true;
                } else {
                    tokens.push(new NumberToken(parseFloat(buffer.read())));
                    buffer.clear();
                    state = LexerState.UNKNOWN;
                    i -= 1;
                }
            }

            if (state === LexerState.STRING) {
                if (stringQuote === undefined) {
                    stringQuote = current;
                } else {
                    if (stringEscaped) {
                        stringEscaped = false;
                        buffer.write(current);
                    } else {
                        if (this.isStringEscapeChar(current)) {
                            stringEscaped = true;
                        } else {
                            if (current !== stringQuote) {
                                buffer.write(current);
                            } else {
                                tokens.push(new StringToken(buffer.read()));
                                buffer.clear();
                                state = LexerState.UNKNOWN;
                                i -= 1;
                            }
                        }
                    }
                }
            }

            if (state === LexerState.KEYWORD) {
                if (this.isExtendedKeywordChar(current)) {
                    buffer.write(current);
                } else {
                    tokens.push(this.makeToken(buffer.read()));
                    buffer.clear();
                    state = LexerState.UNKNOWN;
                    i -= 1;
                }
            }

            if (state === LexerState.OTHER) {
                if (this.isShortControlChar(current)) {
                    buffer.write(current);
                    tokens.push(this.makeToken(buffer.read()));
                    buffer.clear();
                    state = LexerState.UNKNOWN;
                } else if (this.isControlChar(current)) {
                    buffer.write(current);
                } else {
                    tokens.push(this.makeToken(buffer.read()));
                    buffer.clear();
                    state = LexerState.UNKNOWN;
                    i -= 1;
                }
            }
        }
        tokens.push(new ReservedToken(TokenType.EOF));
        return tokens;
    }
    private makeToken(word: string): Token {
        // reserved keyword
        if (word === TokenType.AND) {
            return new ReservedToken(TokenType.AND);
        }
        if (word === TokenType.BREAK) {
            return new ReservedToken(TokenType.BREAK);
        }
        if (word === TokenType.DO) {
            return new ReservedToken(TokenType.DO);
        }
        if (word === TokenType.ELSE) {
            return new ReservedToken(TokenType.ELSE);
        }
        if (word === TokenType.ELSEIF) {
            return new ReservedToken(TokenType.ELSEIF);
        }
        if (word === TokenType.END) {
            return new ReservedToken(TokenType.END);
        }
        if (word === TokenType.FALSE) {
            return new ReservedToken(TokenType.FALSE);
        }
        if (word === TokenType.FOR) {
            return new ReservedToken(TokenType.FOR);
        }
        if (word === TokenType.FUNCTION) {
            return new ReservedToken(TokenType.FUNCTION);
        }
        if (word === TokenType.IF) {
            return new ReservedToken(TokenType.IF);
        }
        if (word === TokenType.IN) {
            return new ReservedToken(TokenType.IN);
        }
        if (word === TokenType.LOCAL) {
            return new ReservedToken(TokenType.LOCAL);
        }
        if (word === TokenType.NIL) {
            return new ReservedToken(TokenType.NIL);
        }
        if (word === TokenType.NOT) {
            return new ReservedToken(TokenType.NOT);
        }
        if (word === TokenType.OR) {
            return new ReservedToken(TokenType.OR);
        }
        if (word === TokenType.REPEAT) {
            return new ReservedToken(TokenType.REPEAT);
        }
        if (word === TokenType.RETURN) {
            return new ReservedToken(TokenType.RETURN);
        }
        if (word === TokenType.THEN) {
            return new ReservedToken(TokenType.THEN);
        }
        if (word === TokenType.TRUE) {
            return new ReservedToken(TokenType.TRUE);
        }
        if (word === TokenType.UNTIL) {
            return new ReservedToken(TokenType.UNTIL);
        }
        if (word === TokenType.WHILE) {
            return new ReservedToken(TokenType.WHILE);
        }
        // reserved other
        if (word === TokenType.ADDITION) {
            return new ReservedToken(TokenType.ADDITION);
        }
        if (word === TokenType.SUBTRACTION) {
            return new ReservedToken(TokenType.SUBTRACTION);
        }
        if (word === TokenType.MULTIPLICATION) {
            return new ReservedToken(TokenType.MULTIPLICATION);
        }
        if (word === TokenType.DIVISION) {
            return new ReservedToken(TokenType.DIVISION);
        }
        if (word === TokenType.MODULO) {
            return new ReservedToken(TokenType.MODULO);
        }
        if (word === TokenType.EXPONENTIATION) {
            return new ReservedToken(TokenType.EXPONENTIATION);
        }
        if (word === TokenType.LENGTH) {
            return new ReservedToken(TokenType.LENGTH);
        }
        if (word === TokenType.EQEQ) {
            return new ReservedToken(TokenType.EQEQ);
        }
        if (word === TokenType.NEQ) {
            return new ReservedToken(TokenType.NEQ);
        }
        if (word === TokenType.LTEQ) {
            return new ReservedToken(TokenType.LTEQ);
        }
        if (word === TokenType.MTEQ) {
            return new ReservedToken(TokenType.MTEQ);
        }
        if (word === TokenType.LT) {
            return new ReservedToken(TokenType.LT);
        }
        if (word === TokenType.MT) {
            return new ReservedToken(TokenType.MT);
        }
        if (word === TokenType.EQ) {
            return new ReservedToken(TokenType.EQ);
        }
        if (word === TokenType.PO) {
            return new ReservedToken(TokenType.PO);
        }
        if (word === TokenType.PC) {
            return new ReservedToken(TokenType.PC);
        }
        if (word === TokenType.BO) {
            return new ReservedToken(TokenType.BO);
        }
        if (word === TokenType.BC) {
            return new ReservedToken(TokenType.BC);
        }
        if (word === TokenType.TO) {
            return new ReservedToken(TokenType.TO);
        }
        if (word === TokenType.TC) {
            return new ReservedToken(TokenType.TC);
        }
        if (word === TokenType.EOS) {
            return new ReservedToken(TokenType.EOS);
        }
        if (word === TokenType.SDEREF) {
            return new ReservedToken(TokenType.SDEREF);
        }
        if (word === TokenType.SEP) {
            return new ReservedToken(TokenType.SEP);
        }
        if (word === TokenType.DEREF) {
            return new ReservedToken(TokenType.DEREF);
        }
        if (word === TokenType.CONCAT) {
            return new ReservedToken(TokenType.CONCAT);
        }
        if (word === TokenType.VARARG) {
            return new ReservedToken(TokenType.VARARG);
        }

        return new IdentifierToken(word);
    }
}
