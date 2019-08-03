<?php
/**
 * Created by PhpStorm.
 * User: Seif
 * Date: 21/07/2019
 * Time: 21:41
 */


namespace DemandeBundle\Enum;

abstract class DemandeEtatEnum
{
    const ETAT_EnTraitement = "EnTraitement";
    const ETAT_EnCours = "EnCours";
    const ETAT_Valide = "Valide";
    const ETAT_Cloture = "Cloture";
    const ETAT_Retour = "Retour";

    /** @var array user friendly named type */
    protected static $typeName = [
        self::ETAT_EnTraitement => 'EnTraitement',
        self::ETAT_EnCours => 'EnCours',
        self::ETAT_Valide => 'Valide',
        self::ETAT_Cloture => 'Cloture',
        self::ETAT_Retour => 'Retour',
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
            self::ETAT_EnTraitement ,
            self::ETAT_EnCours ,
            self::ETAT_Valide ,
            self::ETAT_Cloture,
            self::ETAT_Retour
        ];
    }
}