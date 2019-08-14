<?php
/**
 * Created by PhpStorm.
 * User: Seif
 * Date: 21/07/2019
 * Time: 21:41
 */


namespace ReclamationBundle\Enum;

abstract class ReclamationEtatEnum
{
    const ETAT_EnCours = "EnCours";
    const ETAT_Cloture = "Cloture";

    /** @var array user friendly named type */
    protected static $typeName = [
        self::ETAT_EnCours => 'EnCours',
        self::ETAT_Cloture => 'Cloture',
    ];

    /**
     * @param  string $typeShortName
     * @return string
     */
    public static function getTypeName($typeShortName)
    {
        if (!isset(static::$typeName[$typeShortName])) {
            return "Unknown type ($typeShortName)";
        }

        return static::$typeName[$typeShortName];
    }

    /**
     * @return array<string>
     */
    public static function getAvailableTypes()
    {
        return [
            self::ETAT_EnCours ,
            self::ETAT_Cloture,
        ];
    }
}