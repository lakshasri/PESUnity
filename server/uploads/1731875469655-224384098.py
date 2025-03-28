from ply import lex

class RustLexer:
    # List of token names
    tokens = (
        # Keywords
        'FN', 'LET', 'MUT', 'PUB', 'STRUCT', 'ENUM', 'MATCH',
        'IF', 'ELSE', 'WHILE', 'FOR', 'IN', 'RETURN', 'BREAK',
        'CONTINUE', 'IMPL', 'TRAIT', 'TYPE', 'USE', 'MOD',
        
        # Datatypes
        'INTEGER', 'FLOAT', 'STRING', 'BOOL',
        
        # Identifiers
        'IDENT',
        
        # Operators
        'PLUS', 'MINUS', 'TIMES', 'DIVIDE', 'MODULO',
        'EQ', 'NEQ', 'LT', 'GT', 'LE', 'GE',
        'AND', 'OR', 'NOT',
        'ASSIGN', 'ARROW',
        
        # Delimiters
        'LPAREN', 'RPAREN',      # ( )
        'LBRACE', 'RBRACE',      # { }
        'LBRACKET', 'RBRACKET',  # [ ]
        'SEMICOLON', 'COLON',    # ; :
        'COMMA', 'DOT',          # , .
    )

    # Regular expressions for simple tokens
    t_PLUS = r'\+'
    t_MINUS = r'-'
    t_TIMES = r'\*'
    t_DIVIDE = r'/'
    t_MODULO = r'%'
    t_EQ = r'=='
    t_NEQ = r'!='
    t_LT = r'<'
    t_GT = r'>'
    t_LE = r'<='
    t_GE = r'>='
    t_ASSIGN = r'='
    t_ARROW = r'->'
    t_LPAREN = r'\('
    t_RPAREN = r'\)'
    t_LBRACE = r'\{'
    t_RBRACE = r'\}'
    t_LBRACKET = r'\['
    t_RBRACKET = r'\]'
    t_SEMICOLON = r';'
    t_COLON = r':'
    t_COMMA = r','
    t_DOT = r'\.'

    # Keywords mapping
    keywords = {
        'fn': 'FN',
        'let': 'LET',
        'mut': 'MUT',
        'pub': 'PUB',
        'struct': 'STRUCT',
        'enum': 'ENUM',
        'match': 'MATCH',
        'if': 'IF',
        'else': 'ELSE',
        'while': 'WHILE',
        'for': 'FOR',
        'in': 'IN',
        'return': 'RETURN',
        'break': 'BREAK',
        'continue': 'CONTINUE',
        'impl': 'IMPL',
        'trait': 'TRAIT',
        'type': 'TYPE',
        'use': 'USE',
        'mod': 'MOD',
        'true': 'BOOL',
        'false': 'BOOL'
    }

    # Ignored characters (whitespace)
    t_ignore = ' \t'

    # Complex tokens
    def t_FLOAT(self, t):
        r'\d*\.\d+'
        t.value = float(t.value)
        return t

    def t_INTEGER(self, t):
        r'\d+'
        t.value = int(t.value)
        return t

    def t_STRING(self, t):
        r'\"([^\\\n]|(\\.))*?\"'
        t.value = t.value[1:-1]  # Remove quotes
        return t

    def t_IDENT(self, t):
        r'[a-zA-Z_][a-zA-Z0-9_]*'
        # Check if identifier is a keyword
        t.type = self.keywords.get(t.value, 'IDENT')
        return t

    def t_newline(self, t):
        r'\n+'
        t.lexer.lineno += len(t.value)

    # Comments
    def t_COMMENT(self, t):
        r'//.*'
        pass  # Ignore comments

    def t_error(self, t):
        print(f"Illegal character '{t.value[0]}' at line {t.lexer.lineno}")
        t.lexer.skip(1)

    def build(self, **kwargs):
        self.lexer = lex.lex(module=self, **kwargs)

    def tokenize(self, data):
        self.lexer.input(data)
        while True:
            tok = self.lexer.token()
            if not tok:
                break
            yield tok

# Example usage function
def test_lexer():
    # Create an instance of our lexer
    lexer = RustLexer()
    lexer.build()
    
    # Test input
    test_code = """
    fn main() {
        let mut x: i32 = 42;
        if x > 0 {
            println!("Positive number");
        }
    }
    """
    
    # Tokenize and print results
    for token in lexer.tokenize(test_code):
        print(f"Token: {token.type}, Value: {token.value}")

if __name__ == '__main__':
    test_lexer()
