import { expect } from "chai";
import Lexer, { ReservedToken, TokenType, IdentifierToken, StringToken, NumberToken } from "./lexer";

describe("lexer", () => {
    describe("tokenize", () => {
        it("should tokenize numbers", () => {
            const lexer = new Lexer();

            expect(lexer.tokenize("0")).to.deep.equal([new NumberToken(0), new ReservedToken(TokenType.EOF)]);
            expect(lexer.tokenize("123")).to.deep.equal([new NumberToken(123), new ReservedToken(TokenType.EOF)]);
            expect(lexer.tokenize("12.34")).to.deep.equal([new NumberToken(12.34), new ReservedToken(TokenType.EOF)]);
            expect(lexer.tokenize("0.123")).to.deep.equal([new NumberToken(0.123), new ReservedToken(TokenType.EOF)]);
            expect(lexer.tokenize(".8")).to.deep.equal([new NumberToken(0.8), new ReservedToken(TokenType.EOF)]);
        });
        it("should tokenize strings", () => {
            const lexer = new Lexer();

            expect(lexer.tokenize('"hello"')).to.deep.equal([
                new StringToken("hello"),
                new ReservedToken(TokenType.EOF),
            ]);
            expect(lexer.tokenize("'hello world'")).to.deep.equal([
                new StringToken("hello world"),
                new ReservedToken(TokenType.EOF),
            ]);
            expect(lexer.tokenize('"quoted \\"things\\" test"')).to.deep.equal([
                new StringToken('quoted "things" test'),
                new ReservedToken(TokenType.EOF),
            ]);
        });
        it("should tokenize identifiers", () => {
            const lexer = new Lexer();

            expect(lexer.tokenize("abc")).to.deep.equal([new IdentifierToken("abc"), new ReservedToken(TokenType.EOF)]);
            expect(lexer.tokenize("a_1_B")).to.deep.equal([
                new IdentifierToken("a_1_B"),
                new ReservedToken(TokenType.EOF),
            ]);
            expect(lexer.tokenize("tree House4 d_o_g")).to.deep.equal([
                new IdentifierToken("tree"),
                new IdentifierToken("House4"),
                new IdentifierToken("d_o_g"),
                new ReservedToken(TokenType.EOF),
            ]);
        });
        it("should tokenize reserved keywords", () => {
            const lexer = new Lexer();

            expect(lexer.tokenize("true and false")).to.deep.equal([
                new ReservedToken(TokenType.TRUE),
                new ReservedToken(TokenType.AND),
                new ReservedToken(TokenType.FALSE),
                new ReservedToken(TokenType.EOF),
            ]);
            expect(lexer.tokenize("while true do false end")).to.deep.equal([
                new ReservedToken(TokenType.WHILE),
                new ReservedToken(TokenType.TRUE),
                new ReservedToken(TokenType.DO),
                new ReservedToken(TokenType.FALSE),
                new ReservedToken(TokenType.END),
                new ReservedToken(TokenType.EOF),
            ]);
            expect(
                lexer.tokenize(
                    "and break do else elseif end false for function if in local nil not or repeat return then true until while",
                ),
            ).to.deep.equal([
                new ReservedToken(TokenType.AND),
                new ReservedToken(TokenType.BREAK),
                new ReservedToken(TokenType.DO),
                new ReservedToken(TokenType.ELSE),
                new ReservedToken(TokenType.ELSEIF),
                new ReservedToken(TokenType.END),
                new ReservedToken(TokenType.FALSE),
                new ReservedToken(TokenType.FOR),
                new ReservedToken(TokenType.FUNCTION),
                new ReservedToken(TokenType.IF),
                new ReservedToken(TokenType.IN),
                new ReservedToken(TokenType.LOCAL),
                new ReservedToken(TokenType.NIL),
                new ReservedToken(TokenType.NOT),
                new ReservedToken(TokenType.OR),
                new ReservedToken(TokenType.REPEAT),
                new ReservedToken(TokenType.RETURN),
                new ReservedToken(TokenType.THEN),
                new ReservedToken(TokenType.TRUE),
                new ReservedToken(TokenType.UNTIL),
                new ReservedToken(TokenType.WHILE),
                new ReservedToken(TokenType.EOF),
            ]);
        });
        it("should tokenize controls", () => {
            const lexer = new Lexer();

            expect(lexer.tokenize("+ - * / % ^ # == ~= <= >= < > = ( ) { } [ ] ; : , . .. ...")).to.deep.equal([
                new ReservedToken(TokenType.ADDITION),
                new ReservedToken(TokenType.SUBTRACTION),
                new ReservedToken(TokenType.MULTIPLICATION),
                new ReservedToken(TokenType.DIVISION),
                new ReservedToken(TokenType.MODULO),
                new ReservedToken(TokenType.EXPONENTIATION),
                new ReservedToken(TokenType.LENGTH),
                new ReservedToken(TokenType.EQEQ),
                new ReservedToken(TokenType.NEQ),
                new ReservedToken(TokenType.LTEQ),
                new ReservedToken(TokenType.MTEQ),
                new ReservedToken(TokenType.LT),
                new ReservedToken(TokenType.MT),
                new ReservedToken(TokenType.EQ),
                new ReservedToken(TokenType.PO),
                new ReservedToken(TokenType.PC),
                new ReservedToken(TokenType.BO),
                new ReservedToken(TokenType.BC),
                new ReservedToken(TokenType.TO),
                new ReservedToken(TokenType.TC),
                new ReservedToken(TokenType.EOS),
                new ReservedToken(TokenType.SDEREF),
                new ReservedToken(TokenType.SEP),
                new ReservedToken(TokenType.DEREF),
                new ReservedToken(TokenType.CONCAT),
                new ReservedToken(TokenType.VARARG),
                new ReservedToken(TokenType.EOF),
            ]);
        });
        it("should tokenize mixed", () => {
            const lexer = new Lexer();

            expect(lexer.tokenize("a == 34.2")).to.deep.equal([
                new IdentifierToken("a"),
                new ReservedToken(TokenType.EQEQ),
                new NumberToken(34.2),
                new ReservedToken(TokenType.EOF),
            ]);
            expect(lexer.tokenize('a="hello world"')).to.deep.equal([
                new IdentifierToken("a"),
                new ReservedToken(TokenType.EQ),
                new StringToken("hello world"),
                new ReservedToken(TokenType.EOF),
            ]);
        });
    });
});
