<?php
/**
 * Created by PhpStorm.
 * User: Seif
 * Date: 29/07/2019
 * Time: 20:35
 */

/**
 * Class DateFormatFunction
 *
 * Adds the hability to use the MySQL DATE_FORMAT function inside Doctrine
 *
 * @package Vf\Bundle\VouchedforBundle\DQL
 */

namespace DemandeBundle\DQL;


use Doctrine\ORM\Query\Lexer;
use Doctrine\ORM\Query\AST\Functions\FunctionNode;
use Doctrine\ORM\Query\SqlWalker;
use Doctrine\ORM\Query\Parser;

class DateFormatFunction extends FunctionNode
{

    /**
     * Holds the timestamp of the DATE_FORMAT DQL statement
     * @var $dateExpression
     */
    protected $dateExpression;

    /**
     * Holds the '% format' parameter of the DATE_FORMAT DQL statement
     * var String
     */
    protected $formatChar;

    public function getSql( SqlWalker $sqlWalker )
    {
        return 'DATE_FORMAT (' . $sqlWalker->walkArithmeticExpression( $this->dateExpression ) . ',' . $sqlWalker->walkStringPrimary( $this->formatChar ) . ')';
    }

    public function parse( Parser $parser )
    {
        $parser->Match( Lexer::T_IDENTIFIER );
        $parser->Match( Lexer::T_OPEN_PARENTHESIS );

        $this->dateExpression = $parser->ArithmeticExpression();
        $parser->Match( Lexer::T_COMMA );

        $this->formatChar = $parser->ArithmeticExpression();

        $parser->Match( Lexer::T_CLOSE_PARENTHESIS );
    }
}
