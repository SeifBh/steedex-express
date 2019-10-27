<?php
/**
 * Created by PhpStorm.
 * User: Seif
 * Date: 21/07/2019
 * Time: 21:41
 */


namespace DemandeBundle\Enum;

abstract class DemandeTypeDCEnum
{
    const TYPE_Remise = "Remise";
    const TYPE_Recuperation = "Recuperation";
    const TYPE_Faire = "Faire";
    const TYPE_Achat = "Achat";
    const TYPE_Versement = "Versement";

    /** @var array user friendly named type */
    protected static $typeName = [
        self::TYPE_Remise => 'Remise',
        self::TYPE_Recuperation => 'Recuperation',
        self::TYPE_Faire => 'Faire',
        self::TYPE_Achat => 'Achat',
        self::TYPE_Versement => 'Versement',
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
            self::TYPE_Remise ,
            self::TYPE_Recuperation ,
            self::TYPE_Faire ,
            self::TYPE_Achat,
            self::TYPE_Versement
        ];
    }
}